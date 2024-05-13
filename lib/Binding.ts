import { ContraintType, IContraint, IPredicate, IShape } from "./Shape";
import { IStarPatternWithDependencies, type ITriple } from "./Triple";

export interface IBindings {
    isFullyBounded: () => boolean;
    getVisitStatus: () => VisitStatus;
    getUnboundedTriple: () => ITriple[];
    getBindings: () => Map<string, ITriple | undefined>;
    getBoundTriple: () => ITriple[]
}

export class Bindings implements IBindings {
    private readonly shape: IShape;
    // indexed by iri
    private readonly linkedShape: Map<string, IShape>;
    private readonly starpattern: IStarPatternWithDependencies;
    // indexed by predicate
    private bindings: Map<string, ITriple | undefined> = new Map();
    private unboundTriple: ITriple[] = [];
    private fullyBounded: boolean = false;

    public constructor(shape: IShape, starPattern: IStarPatternWithDependencies, linkedShape: Map<string, IShape>) {
        this.shape = shape;
        this.starpattern = starPattern;
        this.linkedShape = linkedShape;
        for (const { triple } of starPattern.starPattern.values()) {
            this.bindings.set(triple.predicate, undefined);
        }
        this.calculateBinding();
    }


    private calculateBinding() {
        for (const { triple, dependencies } of this.starpattern.starPattern.values()) {
            const predicate = this.shape.get(triple.predicate);
            if (predicate === undefined) {
                this.unboundTriple.push(triple);
                continue;
            }
            const constraint = predicate.constraint;
            if (constraint === undefined) {
                this.bindings.set(predicate.name, triple);
                continue;
            }

            if (this.handleShapeConstraint(constraint, predicate, triple, dependencies)) {
                continue;
            }

            if (this.handleShapeType(constraint, predicate, triple)) {
                continue;
            }

            this.bindings.set(predicate.name, triple);
        }

        if (this.shape.closed === false) {
            this.fullyBounded = true;
        } else {
            this.fullyBounded = this.unboundTriple.length === 0;
        }
    }

    private handleShapeConstraint(
        constraint: IContraint,
        predicate: IPredicate,
        triple: ITriple,
        dependencies?: IStarPatternWithDependencies): boolean {
        if (constraint.type === ContraintType.SHAPE && dependencies !== undefined && constraint.value.size == 1) {
            const shapeName: string = constraint.value.values().next().value;
            const linkedShape = this.linkedShape.get(shapeName);
            if (linkedShape === undefined) {
                this.bindings.set(predicate.name, triple);
                return true;
            }

            const nestedBinding = new Bindings(linkedShape, dependencies, this.linkedShape);
            if (nestedBinding.isFullyBounded()) {
                this.bindings.set(predicate.name, triple);
            } else {
                this.unboundTriple.push(triple);
            }
            return true;
        }

        return false
    }



    private handleShapeType(
        constraint: IContraint,
        predicate: IPredicate,
        triple: ITriple): boolean {
        if (constraint.type === ContraintType.TYPE &&
            !Array.isArray(triple.object) &&
            triple.object.termType === "Literal"
            && constraint.value.has(triple.object.datatype.value)
        ) {
            this.bindings.set(predicate.name, triple);
            return true;
        } else if (constraint.type === ContraintType.TYPE &&
            !Array.isArray(triple.object) &&
            triple.object.termType === "Literal"
            && !constraint.value.has(triple.object.datatype.value)) {
            this.unboundTriple.push(triple);
            return true;
        }
        return false
    }


    public isFullyBounded() {
        return this.fullyBounded && this.starpattern.starPattern.size !== 0;
    }

    public getVisitStatus(): VisitStatus {
        if (this.isFullyBounded()) {
            return VisitStatus.CONTAIN;
        } else if (this.getBoundTriple().length > 0) {
            return VisitStatus.VISIT;
        } else {
            return VisitStatus.REJECT;
        }

    }

    public getUnboundedTriple(): ITriple[] {
        return new Array(...this.unboundTriple);
    }

    public getBindings(): Map<string, ITriple | undefined> {
        return new Map(this.bindings);
    }

    public getBoundTriple(): ITriple[] {
        const resp: ITriple[] = [];
        for (const triple of this.bindings.values()) {
            if (triple !== undefined) {
                resp.push(triple);
            }
        }
        return resp;
    }
}

export enum VisitStatus {
    REJECT,
    VISIT,
    CONTAIN
}
