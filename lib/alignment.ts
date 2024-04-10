import { TYPE_DEFINITION } from './constant';
import type { Query } from './query';
import { ContraintType, type IShape } from './Shape';
import type { ITriple } from './Triple';
import { AlignmentType } from './Triple';

/**
 * Calculate the alignment of every subject group with every shape
 * @param {IReportAlignmentArgs} args -  the parameters of the calculation of the alignment
 * @returns {IResult} - A table of result
 * @todo get unaligned properties
 */
export function reportAlignment({ query, shapes, option }: IReportAlignmentArgs): IResult {
  const res: IResult = {
    allSubjectGroupsHaveStrongAlignment: false,
    alignedTable: new Map(),
    unAlignedShapes: new Set(),
  };

  if (query.size === 0 || shapes.length === 0) {
    return res;
  }

  const alignmentFunction = option.strongAlignment === true ?
    subjectGroupIsAligned :
    subjectGroupIsWeaklyAligned;

  calculateAligment(query, shapes, res, alignmentFunction);

  if (option.shapeIntersection ?? false) {
    calculateAlignmentWithIntersection(query, shapes, res);
  }
  reportUnalignedShapes(shapes, res);
  return res;
}

function reportUnalignedShapes(shapes: IShape[], res: IResult): void {
  const alignedShapes: Set<ShapeName> = new Set();
  const allShapes: Set<ShapeName> = new Set(shapes.map(shape => shape.name));

  for (const alignmentResults of res.alignedTable.values()) {
    for (const [ shapeName, result ] of alignmentResults) {
      if (result !== AlignmentType.None) {
        alignedShapes.add(shapeName);
      }
    }
  }
  for (const shapeName of allShapes) {
    if (!alignedShapes.has(shapeName)) {
      res.unAlignedShapes.add(shapeName);
    }
  }
}

function getAlignedShapes(res: AlignmentResults, shapeMap: Map<string, IShape>): IShape[] {
  const alignedShapes: IShape[] = [];
  for (const [ shapeName, aligment ] of res) {
    if (aligment === AlignmentType.WEAK) {
      // It should always be an existing shape
      alignedShapes.push(shapeMap.get(shapeName)!);
    }
    if (aligment === AlignmentType.STRONG) {
      return [];
    }
  }
  return alignedShapes;
}

/**
 * Consider the intersection between the shape and the query in the result
 * @param {Query} query
 * @param {IShape[]} shapes
 * @param {IResult} res - the result of alignments
 */
function calculateAlignmentWithIntersection(query: Query, shapes: IShape[], res: IResult): void {
  if (shapes.length > 1) {
    const shapeMap: Map<string, IShape> = new Map();
    for (const shape of shapes) {
      shapeMap.set(shape.name, shape);
    }

    for (const [ subjectGroupName, aligmentResultsVal ] of res.alignedTable) {
      const alignedShapes = getAlignedShapes(aligmentResultsVal, shapeMap);
      const alignmentResults = res.alignedTable.get(subjectGroupName)!;
      const prevAligmentResults = new Map(alignmentResults);

      // If there is possible intersection
      if (alignedShapes.length > 1) {
        const highestDegree: [number, string[]] = [ Number.MIN_SAFE_INTEGER, []];
        let hasOpenShape = false;
        for (const targetShape of alignedShapes) {
          // If there is an open shape the intersection cannot be used to discriminate
          if (targetShape.closed === false) {
            hasOpenShape = true;
            break;
          }
          const subjectGroup = query.get(subjectGroupName)!;
          alignmentResults.set(targetShape.name, AlignmentType.None);
          const alignmentDegree = degreeOfAlignmentExclusif(subjectGroup, targetShape);
          // If subject group is a subset of the shape then we check which shape is more
          // aligned with the subject group
          if (alignmentDegree !== -1) {
            if (highestDegree[0] === alignmentDegree) {
              highestDegree[1].push(targetShape.name);
            } else if (highestDegree[0] < alignmentDegree) {
              highestDegree[0] = alignmentDegree;
              highestDegree[1] = [ targetShape.name ];
            }
          }
        }

        // We used the previous results if the alignment didn't changed anything
        // or if one shape is open
        if (highestDegree[0] === Number.MIN_SAFE_INTEGER || hasOpenShape) {
          for (const [ key, value ] of prevAligmentResults) {
            alignmentResults.set(key, value);
          }
        } else {
          // Propagate the results
          for (const shapeName of highestDegree[1]) {
            alignmentResults.set(shapeName, AlignmentType.WEAK);
          }
        }
      }
    }
  }
}

/**
 * Calculate the alignment based on the alignment function
 * @param {Query} query
 * @param {IShape[]} shapes
 * @param {IResult} res
 * @param {AlignmentFunction} alignmentFunction
 */
function calculateAligment(
  query: Query,
  shapes: IShape[],
  res: IResult,
  alignmentFunction: AlignmentFunction,
): void {
  let allSubjectGroupHaveStrongAlignment = true;
  for (const [ subjectGroup, triple ] of query) {
    res.alignedTable.set(subjectGroup, new Map());
    let hasStrongAlignment = false;
    for (const shape of shapes) {
      const alignment = alignmentFunction(triple, shape);
      if (alignment === AlignmentType.STRONG) {
        hasStrongAlignment = true;
      }
      res.alignedTable.get(subjectGroup)?.set(shape.name, alignment);
    }
    if (hasStrongAlignment) {
      for (const shape of shapes) {
        const alignment = res.alignedTable.get(subjectGroup)?.get(shape.name);
        if (alignment === AlignmentType.WEAK) {
          res.alignedTable.get(subjectGroup)?.set(shape.name, AlignmentType.None);
        }
      }
    } else {
      allSubjectGroupHaveStrongAlignment = false;
    }
  }
  res.allSubjectGroupsHaveStrongAlignment = allSubjectGroupHaveStrongAlignment;
}

/**
 * Determine if there is a weak alignment in the subject group
 * @param {ITriple[]} subjectGroup
 * @param {IShape} shape
 * @returns {WeakAligmentOrNone} - The alignment
 */
export function subjectGroupIsWeaklyAligned(subjectGroup: ITriple[], shape: IShape): WeakAligmentOrNone {
  if (subjectGroup.length === 0) {
    return AlignmentType.None;
  }

  if (shape.closed === false) {
    return AlignmentType.WEAK;
  }

  for (const triple of subjectGroup) {
    const isAlign = triple.isWeaklyAlign(shape);
    if (isAlign) {
      return AlignmentType.WEAK;
    }
  }
  return AlignmentType.None;
}

/**
 * Determine the alignment of the subject group
 * @param {ITriple[]} subjectGroup
 * @param {IShape} shape
 * @returns {AlignmentType} - The alignment
 */
export function subjectGroupIsAligned(subjectGroup: ITriple[], shape: IShape): AlignmentType {
  if (subjectGroup.length === 0) {
    return AlignmentType.None;
  }

  if (shape.closed === false) {
    return AlignmentType.WEAK;
  }

  const alignedProperties: Set<string> = new Set();

  for (const triple of subjectGroup) {
    // Check if there is a strong alignment based on the RDF class
    if (triple.predicate === TYPE_DEFINITION.value) {
      const predicateProperties = shape.get(triple.predicate);
      const hasTheRightClass = predicateProperties?.constraint?.value?.has(triple.object.value);
      const hasTheTypeConstraint = predicateProperties?.constraint?.type === ContraintType.TYPE;

      if (hasTheTypeConstraint && hasTheRightClass) {
        return AlignmentType.STRONG;
      }
    }
    const isAlign = triple.isWeaklyAlign(shape);
    if (isAlign) {
      alignedProperties.add(triple.predicate);
    }
  }

  const allPredicatesShape = shape.getAll();

  // There cannot be a strong alignment if the subject group has more predicate than the shape
  if (subjectGroup.length > allPredicatesShape.length) {
    return alignedProperties.size > 0 ? AlignmentType.WEAK : AlignmentType.None;
  }

  for (const predicate of allPredicatesShape) {
    // If it is not a negative property or an optional property then it should align with the shape
    if (
      predicate.negative !== true &&
      predicate.optional !== true &&
      !alignedProperties.has(predicate.name)) {
      return alignedProperties.size > 0 ? AlignmentType.WEAK : AlignmentType.None;
    }
  }
  return AlignmentType.STRONG;
}

function degreeOfAlignmentExclusif(subjectGroup: ITriple[], shape: IShape): number {
  let deg = 0;

  for (const triple of subjectGroup) {
    const isAlign = triple.isWeaklyAlign(shape);
    if (isAlign) {
      deg += 1;
    } else {
      return -1;
    }
  }
  return deg;
}

/**
 * The argument of the report alignment function
 */
export interface IReportAlignmentArgs {
  query: Query;
  shapes: IShape[];
  option: IOptions;
}

/**
 * The options for the alignment algorithm
 */
export interface IOptions {
  shapeIntersection?: boolean;
  strongAlignment?: boolean;
}

type subjectGroupName = string;
type ShapeName = string;
type AlignmentResults = Map<ShapeName, AlignmentType>;

/**
 * The alignment result
 */
export interface IResult {
  allSubjectGroupsHaveStrongAlignment: boolean;
  alignedTable: Map<subjectGroupName, AlignmentResults>;
  unAlignedShapes: Set<ShapeName>;
}

type WeakAligmentOrNone = AlignmentType.WEAK | AlignmentType.None;
type AlignmentFunction = (subjectGroup: ITriple[], shape: IShape) => AlignmentType;
