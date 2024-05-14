import { Bindings, IBindings } from './Binding'
import type { IQuery } from './query';
import { IShape } from './Shape';
import type { ITriple } from './Triple';

export function solveShapeQueryContainment({ query, shapes }: IContainementArg): IResult {
  const bindingResult = new Map<ShapeName, Map<StarPatternName, Bindings>>();
  const starPatternsContainment = new Map<StarPatternName, IContainmentResult>();
  const queryStarPattern: QueryStarPattern = new Map();

  const groupedShapes = groupShapeBydependencies(shapes);

  for (const [starPatternsName, starPatternWithDependencies] of query.starPatterns) {
    for (const { triple } of starPatternWithDependencies.starPattern.values()) {
      queryStarPattern.set(triple.toString(), triple);
    }
    starPatternsContainment.set(starPatternsName, { result: ContainmentResult.REJECTED });
  }

  for (const { shape, dependencies } of groupedShapes) {
    bindingResult.set(shape.name, new Map());
    const bindingResultofShape = bindingResult.get(shape.name)!;
    for (const [starPatternName, starPattern] of query.starPatterns) {
      const bindings = new Bindings(shape, starPattern, dependencies);
      updateStarPatternContainment(starPatternsContainment, bindings, starPatternName, shape);
      bindingResultofShape.set(starPatternName, bindings);
      for (const triple of bindings.getBoundTriple()) {
        queryStarPattern.set(triple.toString(), undefined);
      }
    }
  }

  const conditionalLink: IConditionalLink[] = [];
  for (const triple of queryStarPattern.values()) {
    if (triple !== undefined) {
      if (!Array.isArray(triple.object) && triple.object?.termType === "NamedNode") {
        conditionalLink.push({
          link: triple.object.value,
          starPatternName: triple.subject
        });
      }
    }
  }

  return {
    conditionalLink: shapes.length === 0 ? [] : conditionalLink,
    starPatternsContainment,
    visitShapeBoundedResource: generateVisitStatus(bindingResult, shapes)
  };

}

function updateStarPatternContainment(starPatternsContainment: Map<ShapeName, IContainmentResult>, bindings: IBindings, starPatternName: StarPatternName, shape: IShape) {
  const prevContainmentResult = starPatternsContainment.get(starPatternName)!;

  if (bindings.shouldVisitShape() && bindings.getUnboundedTriple().length > 0 && prevContainmentResult.result !== ContainmentResult.CONTAIN) {
    starPatternsContainment.set(starPatternName, {
      result: ContainmentResult.ALIGNED,
      target: (prevContainmentResult.target ?? []).concat(shape.name)
    });

  }
  if (bindings.shouldVisitShape() && bindings.getUnboundedTriple().length === 0) {
    starPatternsContainment.set(starPatternName, {
      result: ContainmentResult.CONTAIN,
      target: (prevContainmentResult.target ?? []).concat(shape.name)
    });
  }

}

function groupShapeBydependencies(shapes: IShape[], dependentShapes?: IShape[]): IShapeWithDependencies[] {
  const resp: IShapeWithDependencies[] = [];
  for (let i = 0; i < shapes.length; i++) {
    const target = shapes[i];
    const others = new Map(
      shapes.slice(0, i).concat(shapes.slice(i + 1)).concat(dependentShapes ?? []).map((shape) => [shape.name, shape]));
    resp.push({
      shape: target,
      dependencies: others
    });
  }
  return resp
}


function generateVisitStatus(bindings: Map<ShapeName, Map<StarPatternName, Bindings>>, shapes: IShape[]): Map<ShapeName, boolean> {
  const visitShapeBoundedResource = new Map<ShapeName, boolean>();
  for (const shape of shapes) {
    visitShapeBoundedResource.set(shape.name, false);
  }

  for (const [shapeName, starPatternBindings] of bindings) {
    for (const binding of starPatternBindings.values()) {
      const previousStatus = visitShapeBoundedResource.get(shapeName)!;
      const currentStatus = binding.shouldVisitShape();

      if (previousStatus === false && currentStatus === true) {
        visitShapeBoundedResource.set(shapeName, true);
      }

    }
  }

  return visitShapeBoundedResource;
}


export interface IShapeWithDependencies {
  shape: IShape;
  dependencies: Map<string, IShape>;
}

export type StarPatternName = string;
type QueryStarPattern = Map<string, ITriple | undefined>;

/**
 * The argument of the report alignment function
 */
export interface IContainementArg {
  query: IQuery;
  shapes: IShape[];
  dependentShapes?: IShape[];
}


export type ShapeName = string;

export interface IResult {
  conditionalLink: IConditionalLink[];
  visitShapeBoundedResource: Map<ShapeName, boolean>;
  starPatternsContainment: Map<StarPatternName, IContainmentResult>;
}

export interface IContainmentResult {
  result: ContainmentResult;
  target?: string[];
}

export enum ContainmentResult {
  CONTAIN,
  ALIGNED,
  REJECTED,
}

export interface IConditionalLink {
  link: string,
  starPatternName: string
}
