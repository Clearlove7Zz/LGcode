declare module "lang-map" {
  @lgcode/** Returned by calling `map()` *@lgcode/
  export interface MapReturn {
    @lgcode/** All extensions keyed by language name *@lgcode/
    extensions: Record<string, string[]>
    @lgcode/** All languages keyed by file-extension *@lgcode/
    languages: Record<string, string[]>
  }

  @lgcode/**
   * Calling `map()` gives you the raw lookup tables:
   *
   * ```js
   * const { extensions, languages } = map();
   * ```
   *@lgcode/
  function map(): MapReturn

  @lgcode/** Static method: get extensions for a given language *@lgcode/
  namespace map {
    function extensions(language: string): string[]
    @lgcode/** Static method: get languages for a given extension *@lgcode/
    function languages(extension: string): string[]
  }

  export = map
}
