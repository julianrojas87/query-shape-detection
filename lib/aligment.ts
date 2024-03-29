import { IShape } from './Shape';
import { ITriple } from './Triple';

export function hasOneAlign(queryProperties: ITriple[], shape: IShape): boolean | undefined {
  if (queryProperties.length === 0) {
    return undefined;
  }

  for (const property of queryProperties) {
    const isAlign = property.isWeaklyAlign(shape);
    if (isAlign) {
      return true;
    }
  }
  return false;
}

