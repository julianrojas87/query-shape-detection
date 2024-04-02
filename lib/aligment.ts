import { Query } from './query';
import { IShape } from './Shape';
import { ITriple, AlignmentType } from './Triple';


export function calculateAligments({ query, shapes, option }: ICalculateAlignmentArgs): IResult {
  const res: IResult = {
    allSubjectGroupsHaveStrongAligment: false,
    alignedTable: new Map(),
    unAlignedShapes: new Set()
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

function reportUnalignedShapes(shapes: IShape[], res: IResult) {
  const alignedShapes: Set<ShapeName> = new Set();
  const allShapes: Set<ShapeName> = new Set(shapes.map((shape) => shape.name));

  for (const alignmentResults of res.alignedTable.values()) {
    for (const [shapeName, result] of alignmentResults) {
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
  for (const [shapeName, aligment] of res) {
    if (aligment === AlignmentType.WEAK) {
      // it should always be an existing shape
      alignedShapes.push(shapeMap.get(shapeName)!)
    }
  }
  return alignedShapes;
}

function hasAlignedShapes(res: AlignmentResults): boolean {
  for (const aligment of res.values()) {
    if (aligment === AlignmentType.WEAK) {
      return true;
    }
  }
  return false;
}

function calculateAlignmentWithIntersection(query: Query, shapes: IShape[], res: IResult) {
  if (shapes.length > 1) {
    const shapeMap: Map<string, IShape> = new Map();
    for (const shape of shapes) {
      shapeMap.set(shape.name, shape);
    }

    for (let [subjectGroupName, aligmentResultsVal] of res.alignedTable) {
      const alignedShapes = getAlignedShapes(aligmentResultsVal, shapeMap);
      let aligmentResults = res.alignedTable.get(subjectGroupName)!;
      const prevAligmentResults = new Map(aligmentResults);
      if (alignedShapes.length > 1) {
        aligmentResults.clear()
        for (let i = 0; i < alignedShapes.length; ++i) {
          const targetShape = alignedShapes[i];
          const subjectGroup = query.get(subjectGroupName)!;

          if (!allTriplesAlignedWithTheShape(subjectGroup, targetShape)) {
            aligmentResults.set(targetShape.name, AlignmentType.None);
          } else {
            const firstHaft = alignedShapes.slice(0, Math.max(i - 1, 0));
            const secondHaft = alignedShapes.slice(Math.max(i, 1));
            const others: IShape[] = firstHaft.concat(secondHaft);

            const discriminantShape = targetShape.discriminantShape(others)!;

            const alignment = shapeHasAllThePropertiesOfSubjectGroup(subjectGroup, discriminantShape);
            aligmentResults.set(targetShape.name, alignment)
          }
        }
      }
      // the intersection didn't affected the result
      if (!hasAlignedShapes(aligmentResults)) {
        for (const [key, val] of prevAligmentResults) {
          aligmentResults.set(key, val)
        }
      }
    }
  }

}

function calculateWeakAligment(query: Query, shapes: IShape[], res: IResult) {
  for (const [subjectGroup, triple] of query) {
    res.alignedTable.set(subjectGroup, new Map());
    for (const shape of shapes) {
      const alignment = subjectGroupIsWeaklyAligned(triple, shape);
      res.alignedTable.get(subjectGroup)?.set(shape.name, alignment);
    }
  }

}

export function subjectGroupIsWeaklyAligned(subjectGroup: ITriple[], shape: IShape): AlignmentType.WEAK | AlignmentType.None {
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

function shapeHasAllThePropertiesOfSubjectGroup(subjectGroup: ITriple[], shape: IShape): AlignmentType.WEAK | AlignmentType.None {
  const subjectGroupPredicate: Set<string> = new Set(subjectGroup.map((triple) => triple.predicate));
  if (shape.positivePredicates.length === 0) {
    return AlignmentType.None
  }

  for (const property of shape.positivePredicates) {
    if (!subjectGroupPredicate.has(property)) {
      return AlignmentType.None
    }
  }
  return AlignmentType.WEAK;
}

function allTriplesAlignedWithTheShape(subjectGroup: ITriple[], shape: IShape): AlignmentType | AlignmentType.None {
  const shapePredicates: Set<string> = new Set(shape.positivePredicates);
  for (const triple of subjectGroup) {
    if (!shapePredicates.has(triple.predicate)) {
      return AlignmentType.None;
    }
  }
  return AlignmentType.WEAK
}

export interface ICalculateAlignmentArgs {
  query: Query;
  shapes: IShape[],
  option: IOptions
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

