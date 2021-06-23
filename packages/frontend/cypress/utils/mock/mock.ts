import merge from "deepmerge";

export function deepMerge<T>(obj: T, toMerge: DeepPartial<T>): T {
    return merge(obj, toMerge as any)
}

export type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};