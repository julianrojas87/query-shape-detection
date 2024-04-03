import type { Query } from './query';
import type { IShape } from './Shape';
import type { ITriple } from './Triple';
import { AlignmentType } from './Triple';

export function calculateAligments({ query, shapes, option }: ICalculateAlignmentArgs): IResult {
  const res: IResult = {
    allSubjectGroupsHaveStrongAligment: false,
    alignedTable: new Map(),
    unAlignedShapes: new Set(),
  };

  if (query.size === 0 || shapes.length === 0) {
    return res;
  }

  calculateWeakAligment(query, shapes, res);

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
  }
  return alignedShapes;
}

function calculateAlignmentWithIntersection(query: Query, shapes: IShape[], res: IResult): void {
  if (shapes.length > 1) {
    const shapeMap: Map<string, IShape> = new Map();
    for (const shape of shapes) {
      shapeMap.set(shape.name, shape);
    }

    for (const [ subjectGroupName, aligmentResultsVal ] of res.alignedTable) {
      const alignedShapes = getAlignedShapes(aligmentResultsVal, shapeMap);
      const aligmentResults = res.alignedTable.get(subjectGroupName)!;
      const prevAligmentResults = new Map(aligmentResults);
      // If there is possible intersection
      if (alignedShapes.length > 1) {
        const highestDegree: [number, string[]] = [ Number.MIN_SAFE_INTEGER, []];
        let hasOpenShape = false;
        for (const targetShape of alignedShapes) {
          if (targetShape.closed === false) {
            hasOpenShape = true;
            break;
          }
          const subjectGroup = query.get(subjectGroupName)!;
          aligmentResults.set(targetShape.name, AlignmentType.None);
          const alignmentDegree = degreeOfAlignmentExclusif(subjectGroup, targetShape);
          // If subject group is a subset of the shape then we check wich shape is more
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

        // We put the previous results if the alignment didn't changed anything
        // or a shape was open
        if (highestDegree[0] === Number.MIN_SAFE_INTEGER || hasOpenShape) {
          for (const [ key, value ] of prevAligmentResults) {
            aligmentResults.set(key, value);
          }
        } else {
          for (const shapeName of highestDegree[1]) {
            aligmentResults.set(shapeName, AlignmentType.WEAK);
          }
        }
      }
    }
  }
}

function calculateWeakAligment(query: Query, shapes: IShape[], res: IResult): void {
  for (const [ subjectGroup, triple ] of query) {
    res.alignedTable.set(subjectGroup, new Map());
    for (const shape of shapes) {
      const alignment = subjectGroupIsWeaklyAligned(triple, shape);
      res.alignedTable.get(subjectGroup)?.set(shape.name, alignment);
    }
  }
}

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

export interface ICalculateAlignmentArgs {
  query: Query;
  shapes: IShape[];
  option: IOptions;
}

export interface IOptions {
  shapeIntersection?: boolean;
  strongAlignment?: boolean;
}

type subjectGroupName = string;
type ShapeName = string;
type AlignmentResults = Map<ShapeName, AlignmentType>;
export interface IResult {
  allSubjectGroupsHaveStrongAligment: boolean;
  alignedTable: Map<subjectGroupName, AlignmentResults>;
  unAlignedShapes: Set<ShapeName>;
}

type WeakAligmentOrNone = AlignmentType.WEAK | AlignmentType.None;
