export interface IShape extends IShapeArgs {
    toObject: () => IShapeArgs;
    generateDiscriminantShape: (others: IShape[]) => IShape | undefined;
}

export interface IShapeArgs {
    name: string;
    closed?: boolean;
    positivePredicates: string[];
    negativePredicates?: string[];
}

export class Shape implements IShape {
    public readonly name: string;
    public readonly positivePredicates: string[];
    public readonly negativePredicates: string[];
    public readonly closed?: boolean;

    public constructor({ name, positivePredicates, negativePredicates, closed }: IShapeArgs) {
        this.name = name;
        this.positivePredicates = positivePredicates;
        this.negativePredicates = negativePredicates ?? [];
        this.closed = closed ?? false;

        this.validatePredicates();

        Object.freeze(this.name);
        Object.freeze(this.positivePredicates);
        Object.freeze(this.negativePredicates);
        Object.freeze(this.closed);
    }

    private validatePredicates() {
        const setNegativePredicates = new Set(this.negativePredicates);
        for (const predicate of this.positivePredicates) {
            if (setNegativePredicates.has(predicate)) {
                throw new InconsistentPositiveAndNegativePredicateError(
                    `the predicate ${predicate} is defined in the positive and the negative property`
                );
            }
        }
    }
    public toObject(): IShapeArgs {
        return {
            name: this.name,
            closed: this.closed,
            positivePredicates: this.positivePredicates,
            negativePredicates: this.negativePredicates
        };
    }

    public generateDiscriminantShape(others: IShape[]): IShape | undefined {
        if (this.closed === false || this.closed === undefined) {
            return undefined;
        }
        const disciminantPredicates: string[] = [];

        const otherPredicates: Set<string> = new Set(others
            .map(shape => shape.positivePredicates)
            .reduce((acc: string[], current: string[]) => [...acc, ...current]));

        for (const predicate of this.positivePredicates) {
            if (!otherPredicates.has(predicate)) {
                disciminantPredicates.push(predicate);
            }
        }
        return new Shape({
            name: this.name,
            closed: true,
            positivePredicates: this.positivePredicates,
            negativePredicates: this.negativePredicates
        });
    }
}

export class InconsistentPositiveAndNegativePredicateError extends Error {
    constructor(message: string) {
        super(message);

        Object.setPrototypeOf(this, InconsistentPositiveAndNegativePredicateError.prototype);
    }
}


