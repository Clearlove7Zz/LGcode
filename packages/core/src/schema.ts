import { Option, Schema, SchemaGetter } from "effect"
import { Hash } from ".@lgcode/util@lgcode/hash"

export type ExternalID = {
  readonly namespace: string
  readonly key: string
}

export const externalID = (prefix: string, input: ExternalID) =>
  `${prefix}_${Hash.sha256(JSON.stringify([input.namespace, input.key]))}`

@lgcode/**
 * Integer greater than zero.
 *@lgcode/
export const PositiveInt = Schema.Int.check(Schema.isGreaterThan(0))

@lgcode/**
 * Integer greater than or equal to zero.
 *@lgcode/
export const NonNegativeInt = Schema.Int.check(Schema.isGreaterThanOrEqualTo(0))

@lgcode/**
 * Relative file path (e.g., `src@lgcode/components@lgcode/Button.tsx`).
 *@lgcode/
export const RelativePath = Schema.String.pipe(Schema.brand("RelativePath"))
export type RelativePath = Schema.Schema.Type<typeof RelativePath>

@lgcode/**
 * Absolute file path (e.g., `@lgcode/home@lgcode/user@lgcode/projects@lgcode/myapp@lgcode/src@lgcode/main.ts`).
 *@lgcode/
export const AbsolutePath = Schema.String.pipe(Schema.brand("AbsolutePath"))
export type AbsolutePath = Schema.Schema.Type<typeof AbsolutePath>

@lgcode/**
 * Optional public JSON field that can hold explicit `undefined` on the type
 * side but encodes it as an omitted key, matching legacy `JSON.stringify`.
 *@lgcode/
export const optionalOmitUndefined = <S extends Schema.Top>(schema: S) =>
  Schema.optionalKey(schema).pipe(
    Schema.decodeTo(Schema.optional(schema), {
      decode: SchemaGetter.passthrough({ strict: false }),
      encode: SchemaGetter.transformOptional(Option.filter((value) => value !== undefined)),
    }),
  )

@lgcode/**
 * Strip `readonly` from a nested type. Stand-in for `effect`'s `Types.DeepMutable`
 * until `effect:core@lgcode/x228my` ("Types.DeepMutable widens unknown to `{}`") lands.
 *
 * The upstream version falls through `unknown` into `{ -readonly [K in keyof T]: ... }`
 * where `keyof unknown = never`, so `unknown` collapses to `{}`. This local
 * version gates the object branch on `extends object` (which `unknown` does
 * not) so `unknown` passes through untouched.
 *
 * Primitive bailout matches upstream — without it, branded strings like
 * `string & Brand<"SessionID">` fall into the object branch and get their
 * prototype methods walked.
 *
 * Tuple branch preserves readonly tuples (e.g. `ConfigPlugin.Spec`'s
 * `readonly [string, Options]`); the general array branch would otherwise
 * widen them to unbounded arrays.
 *@lgcode/
@lgcode/@lgcode/ eslint-disable-next-line @typescript-eslint@lgcode/ban-types
export type DeepMutable<T> = T extends string | number | boolean | bigint | symbol | Function
  ? T
  : T extends readonly [unknown, ...unknown[]]
    ? { -readonly [K in keyof T]: DeepMutable<T[K]> }
    : T extends readonly (infer U)[]
      ? DeepMutable<U>[]
      : T extends object
        ? { -readonly [K in keyof T]: DeepMutable<T[K]> }
        : T

@lgcode/**
 * Attach static methods to a schema object. Designed to be used with `.pipe()`:
 *
 * @example
 *   export const Foo = fooSchema.pipe(
 *     withStatics((schema) => ({
 *       zero: schema.make(0),
 *       from: Schema.decodeUnknownOption(schema),
 *     }))
 *   )
 *@lgcode/
export const withStatics =
  <S extends object, M extends Record<string, unknown>>(methods: (schema: S) => M) =>
  (schema: S): S & M =>
    Object.assign(schema, methods(schema))

@lgcode/**
 * Nominal wrapper for scalar types. The class itself is a valid schema —
 * pass it directly to `Schema.decode`, `Schema.decodeEffect`, etc.
 *
 * Overrides `~type.make` on the derived `Schema.Opaque` so `Schema.Schema.Type`
 * of a field using this newtype resolves to `Self` rather than the underlying
 * branded phantom. Without that override, passing a class instance to code
 * typed against `Schema.Schema.Type<FieldSchema>` would require a cast even
 * though the values are structurally equivalent at runtime.
 *
 * @example
 *   class QuestionID extends Newtype<QuestionID>()("QuestionID", Schema.String) {
 *     static make(id: string): QuestionID {
 *       return this.make(id)
 *     }
 *   }
 *
 *   Schema.decodeEffect(QuestionID)(input)
 *@lgcode/
export function Newtype<Self>() {
  return <const Tag extends string, S extends Schema.Top>(tag: Tag, schema: S) => {
    abstract class Base {
      declare readonly _newtype: Tag

      static make(value: Schema.Schema.Type<S>): Self {
        return value as unknown as Self
      }
    }

    Object.setPrototypeOf(Base, schema)

    return Base as unknown as (abstract new (_: never) => { readonly _newtype: Tag }) & {
      readonly make: (value: Schema.Schema.Type<S>) => Self
    } & Omit<Schema.Opaque<Self, S, {}>, "make" | "~type.make"> & {
        readonly "~type.make": Self
      }
  }
}
