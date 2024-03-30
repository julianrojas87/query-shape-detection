import { Query } from './query';
import { IShape } from './Shape';
import { ITriple, AlignmentType } from './Triple';


export function calculateAligments({ query, shapes, option }: ICalculateAlignmentArgs): IResult {
  const res: IResult = {
    allSubjectGroupsHaveStrongAligment: false,
    alignedTable: new Map(),
    unAlignedShapes: new Set()
  };

  calculateWeakAligment(query, shapes, res);

  if (option.shapeIntersection ?? false) {
    calculateAlignmentWithIntersection(query, shapes, res);
  }
  calculateUnAlignedShapes(shapes, res);
  return res;
}

function calculateUnAlignedShapes(shapes: IShape[], res: IResult) {
  const alignedShapes: Set<ShapeName> = new Set();
  const allShapes: Set<ShapeName> = new Set(shapes.map((shape) => shape.name));

  for (const alignmentResults of res.alignedTable.values()) {
    for (const [shapeName, result] of alignmentResults) {
      if (result.alignment !== AlignmentType.None) {
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

function calculateAlignmentWithIntersection(query: Query, shapes: IShape[], res: IResult) {
  for (const [subjectGroupPos, aligmentResults] of res.alignedTable) {
    for (const { shape } of Object.values(aligmentResults)) {
      shapes.push(shape);
    }
    if (shapes.length > 1) {
      for (let i = 0; i < shapes.length; ++i) {
        const firstHaft = shapes.slice(0, Math.max(i - 1, 0));
        const secondHaft = shapes.slice(Math.max(i, 1));
        const targetShape = shapes[i];
        const others: IShape[] = firstHaft.concat(secondHaft);

        const discriminantShape = targetShape.discriminantShape(others)!;

        const subjectGroup = query.get(subjectGroupPos)!;
        const alignment = subjectGroupIsWeaklyAligned(subjectGroup, discriminantShape);
        if (alignment === AlignmentType.WEAK) {
          res.alignedTable.set(subjectGroupPos, new Map([
            [targetShape.name, { shape: targetShape, alignment }]
          ]));
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
      res.alignedTable.get(subjectGroup)?.set(shape.name, {
        shape,
        alignment
      });
    }
  }

}
export function subjectGroupIsWeaklyAligned(subjectGroup: ITriple[], shape: IShape): AlignmentType.WEAK | AlignmentType.None {
  if (subjectGroup.length === 0) {
    return AlignmentType.None;
  }

  for (const triple of subjectGroup) {
    const isAlign = triple.isWeaklyAlign(shape);
    if (isAlign) {
      return AlignmentType.WEAK;
    }
  }
  return AlignmentType.None;
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
type AlignmentResults = Map<ShapeName, IAlignmentResult>;
export interface IResult {
  allSubjectGroupsHaveStrongAligment: boolean;
  alignedTable: Map<subjectGroupName, AlignmentResults>;
  unAlignedShapes: Set<ShapeName>;
}

export interface IAlignmentResult {
  shape: IShape,
  alignment: AlignmentType
}
