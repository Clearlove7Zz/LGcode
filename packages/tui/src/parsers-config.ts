export default {
  @lgcode/@lgcode/ NOTE: FOR markdown, javascript and typescript, we use the opentui built-in parsers
  @lgcode/@lgcode/ Warn: when taking queries from the nvim-treesitter repo, make sure to include the query dependencies as well
  @lgcode/@lgcode/       marked with for example `; inherits: ecma` at the top of the file. Just put the dependencies before the actual query.
  @lgcode/@lgcode/       ALSO: Some queries use breaking changes in the nvim-treesitter repo, that are not compatible with the (web-)tree-sitter parser.
  parsers: [
    {
      filetype: "python",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter@lgcode/tree-sitter-python@lgcode/releases@lgcode/download@lgcode/v0.23.6@lgcode/tree-sitter-python.wasm",
      queries: {
        highlights: [
          @lgcode/@lgcode/ NOTE: This nvim-treesitter query is currently broken, because the parser is not compatible with the query apparently.
          @lgcode/@lgcode/       it is using "except" nodes that the parser is complaining about, but it has been in the query for 3+ years.
          @lgcode/@lgcode/       Unclear.
          @lgcode/@lgcode/ "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/python@lgcode/highlights.scm",
          "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter@lgcode/tree-sitter-python@lgcode/raw@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/highlights.scm",
        ],
        locals: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/python@lgcode/locals.scm",
        ],
      },
    },
    {
      filetype: "rust",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter@lgcode/tree-sitter-rust@lgcode/releases@lgcode/download@lgcode/v0.24.0@lgcode/tree-sitter-rust.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/rust@lgcode/highlights.scm",
        ],
        locals: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/rust@lgcode/locals.scm",
        ],
      },
    },
    {
      filetype: "go",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter@lgcode/tree-sitter-go@lgcode/releases@lgcode/download@lgcode/v0.25.0@lgcode/tree-sitter-go.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/go@lgcode/highlights.scm",
        ],
        locals: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/go@lgcode/locals.scm",
        ],
      },
    },
    {
      filetype: "cpp",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter@lgcode/tree-sitter-cpp@lgcode/releases@lgcode/download@lgcode/v0.23.4@lgcode/tree-sitter-cpp.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/cpp@lgcode/highlights.scm",
        ],
        locals: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/cpp@lgcode/locals.scm",
        ],
      },
    },
    {
      filetype: "csharp",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter@lgcode/tree-sitter-c-sharp@lgcode/releases@lgcode/download@lgcode/v0.23.1@lgcode/tree-sitter-c_sharp.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/c_sharp@lgcode/highlights.scm",
        ],
        locals: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/c_sharp@lgcode/locals.scm",
        ],
      },
    },
    {
      filetype: "bash",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter@lgcode/tree-sitter-bash@lgcode/releases@lgcode/download@lgcode/v0.25.0@lgcode/tree-sitter-bash.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/bash@lgcode/highlights.scm",
        ],
      },
    },
    {
      filetype: "c",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter@lgcode/tree-sitter-c@lgcode/releases@lgcode/download@lgcode/v0.24.1@lgcode/tree-sitter-c.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/c@lgcode/highlights.scm",
        ],
        locals: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/c@lgcode/locals.scm",
        ],
      },
    },
    {
      filetype: "java",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter@lgcode/tree-sitter-java@lgcode/releases@lgcode/download@lgcode/v0.23.5@lgcode/tree-sitter-java.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/java@lgcode/highlights.scm",
        ],
        locals: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/java@lgcode/locals.scm",
        ],
      },
    },
    {
      filetype: "kotlin",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/fwcd@lgcode/tree-sitter-kotlin@lgcode/releases@lgcode/download@lgcode/0.3.8@lgcode/tree-sitter-kotlin.wasm",
      queries: {
        highlights: ["https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/fwcd@lgcode/tree-sitter-kotlin@lgcode/0.3.8@lgcode/queries@lgcode/highlights.scm"],
        locals: ["https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/master@lgcode/queries@lgcode/kotlin@lgcode/locals.scm"],
      },
    },
    {
      filetype: "ruby",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter@lgcode/tree-sitter-ruby@lgcode/releases@lgcode/download@lgcode/v0.23.1@lgcode/tree-sitter-ruby.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/ruby@lgcode/highlights.scm",
        ],
        locals: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/ruby@lgcode/locals.scm",
        ],
      },
    },
    {
      filetype: "php",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter@lgcode/tree-sitter-php@lgcode/releases@lgcode/download@lgcode/v0.24.2@lgcode/tree-sitter-php.wasm",
      queries: {
        highlights: [
          @lgcode/@lgcode/ NOTE: This nvim-treesitter query is currently broken, because the parser is not compatible with the query apparently.
          @lgcode/@lgcode/ "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/php@lgcode/highlights.scm",
          "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter@lgcode/tree-sitter-php@lgcode/raw@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/highlights.scm",
        ],
      },
    },
    {
      filetype: "scala",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter@lgcode/tree-sitter-scala@lgcode/releases@lgcode/download@lgcode/v0.24.0@lgcode/tree-sitter-scala.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/scala@lgcode/highlights.scm",
        ],
      },
    },
    {
      filetype: "html",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter@lgcode/tree-sitter-html@lgcode/releases@lgcode/download@lgcode/v0.23.2@lgcode/tree-sitter-html.wasm",
      queries: {
        highlights: [
          @lgcode/@lgcode/ NOTE: This nvim-treesitter query is currently broken, because the parser is not compatible with the query apparently.
          @lgcode/@lgcode/ "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/html@lgcode/highlights.scm",
          "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter@lgcode/tree-sitter-html@lgcode/raw@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/highlights.scm",
        ],
        @lgcode/@lgcode/ TODO: Injections not working for some reason
        @lgcode/@lgcode/ injections: [
        @lgcode/@lgcode/   "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter@lgcode/tree-sitter-html@lgcode/raw@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/injections.scm",
        @lgcode/@lgcode/ ],
      },
      @lgcode/@lgcode/ injectionMapping: {
      @lgcode/@lgcode/   nodeTypes: {
      @lgcode/@lgcode/     script_element: "javascript",
      @lgcode/@lgcode/     style_element: "css",
      @lgcode/@lgcode/   },
      @lgcode/@lgcode/   infoStringMap: {
      @lgcode/@lgcode/     javascript: "javascript",
      @lgcode/@lgcode/     css: "css",
      @lgcode/@lgcode/   },
      @lgcode/@lgcode/ },
    },
    {
      filetype: "vue",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/anomalyco@lgcode/tree-sitter-vue@lgcode/releases@lgcode/download@lgcode/v0.1.2@lgcode/tree-sitter-vue.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/anomalyco@lgcode/tree-sitter-vue@lgcode/v0.1.2@lgcode/queries@lgcode/html_tags@lgcode/highlights.scm",
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/anomalyco@lgcode/tree-sitter-vue@lgcode/v0.1.2@lgcode/queries@lgcode/vue@lgcode/highlights.scm",
        ],
      },
    },
    {
      filetype: "hcl",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter-grammars@lgcode/tree-sitter-hcl@lgcode/releases@lgcode/download@lgcode/v1.2.0@lgcode/tree-sitter-hcl.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/master@lgcode/queries@lgcode/hcl@lgcode/highlights.scm",
        ],
      },
    },
    {
      filetype: "json",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter@lgcode/tree-sitter-json@lgcode/releases@lgcode/download@lgcode/v0.24.8@lgcode/tree-sitter-json.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/json@lgcode/highlights.scm",
        ],
      },
    },
    {
      filetype: "yaml",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter-grammars@lgcode/tree-sitter-yaml@lgcode/releases@lgcode/download@lgcode/v0.7.2@lgcode/tree-sitter-yaml.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/yaml@lgcode/highlights.scm",
        ],
      },
    },
    {
      filetype: "haskell",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter@lgcode/tree-sitter-haskell@lgcode/releases@lgcode/download@lgcode/v0.23.1@lgcode/tree-sitter-haskell.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/haskell@lgcode/highlights.scm",
        ],
      },
    },
    {
      filetype: "css",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter@lgcode/tree-sitter-css@lgcode/releases@lgcode/download@lgcode/v0.25.0@lgcode/tree-sitter-css.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/css@lgcode/highlights.scm",
        ],
      },
    },
    {
      filetype: "julia",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter@lgcode/tree-sitter-julia@lgcode/releases@lgcode/download@lgcode/v0.23.1@lgcode/tree-sitter-julia.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/julia@lgcode/highlights.scm",
        ],
      },
    },
    {
      filetype: "lua",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter-grammars@lgcode/tree-sitter-lua@lgcode/releases@lgcode/download@lgcode/v0.5.0@lgcode/tree-sitter-lua.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/tree-sitter-grammars@lgcode/tree-sitter-lua@lgcode/v0.5.0@lgcode/queries@lgcode/highlights.scm",
        ],
        locals: ["https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/tree-sitter-grammars@lgcode/tree-sitter-lua@lgcode/v0.5.0@lgcode/queries@lgcode/locals.scm"],
      },
    },
    {
      filetype: "ocaml",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter@lgcode/tree-sitter-ocaml@lgcode/releases@lgcode/download@lgcode/v0.24.2@lgcode/tree-sitter-ocaml.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/ocaml@lgcode/highlights.scm",
        ],
      },
    },
    {
      filetype: "clojure",
      @lgcode/@lgcode/ temporarily using fork to fix issues
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/anomalyco@lgcode/tree-sitter-clojure@lgcode/releases@lgcode/download@lgcode/v0.0.1@lgcode/tree-sitter-clojure.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/clojure@lgcode/highlights.scm",
        ],
      },
    },
    {
      filetype: "swift",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/alex-pinkus@lgcode/tree-sitter-swift@lgcode/releases@lgcode/download@lgcode/0.7.1@lgcode/tree-sitter-swift.wasm",
      queries: {
        highlights: [
          @lgcode/@lgcode/ NOTE: Using parser repo queries instead of nvim-treesitter due to incompatible #lua-match? predicates
          @lgcode/@lgcode/ "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/highlights.scm
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/alex-pinkus@lgcode/tree-sitter-swift@lgcode/main@lgcode/queries@lgcode/highlights.scm",
        ],
        locals: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/swift@lgcode/locals.scm",
        ],
      },
    },
    {
      filetype: "toml",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter-grammars@lgcode/tree-sitter-toml@lgcode/releases@lgcode/download@lgcode/v0.7.0@lgcode/tree-sitter-toml.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/master@lgcode/queries@lgcode/toml@lgcode/highlights.scm",
        ],
      },
    },
    {
      filetype: "nix",
      @lgcode/@lgcode/ TODO: Replace with official tree-sitter-nix WASM when published
      @lgcode/@lgcode/ See: https:@lgcode/@lgcode/github.com@lgcode/nix-community@lgcode/tree-sitter-nix@lgcode/issues@lgcode/66
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/ast-grep@lgcode/ast-grep.github.io@lgcode/raw@lgcode/40b84530640aa83a0d34a20a2b0623d7b8e5ea97@lgcode/website@lgcode/public@lgcode/parsers@lgcode/tree-sitter-nix.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/nix@lgcode/highlights.scm",
        ],
        locals: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/nix@lgcode/locals.scm",
        ],
      },
    },
    {
      filetype: "diff",
      aliases: ["udiff", "patch"],
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter-grammars@lgcode/tree-sitter-diff@lgcode/releases@lgcode/download@lgcode/v0.1.0@lgcode/tree-sitter-diff.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/tree-sitter-grammars@lgcode/tree-sitter-diff@lgcode/master@lgcode/queries@lgcode/highlights.scm",
        ],
      },
    },
    {
      filetype: "elixir",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/elixir-lang@lgcode/tree-sitter-elixir@lgcode/releases@lgcode/download@lgcode/v0.3.5@lgcode/tree-sitter-elixir.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/elixir@lgcode/highlights.scm",
        ],
        locals: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/elixir@lgcode/locals.scm",
        ],
      },
    },
    {
      filetype: "fsharp",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/ionide@lgcode/tree-sitter-fsharp@lgcode/releases@lgcode/download@lgcode/0.3.0@lgcode/tree-sitter-fsharp.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/fsharp@lgcode/highlights.scm",
        ],
      },
    },
    {
      filetype: "r",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/r-lib@lgcode/tree-sitter-r@lgcode/releases@lgcode/download@lgcode/v1.2.0@lgcode/tree-sitter-r.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/r@lgcode/highlights.scm",
        ],
        locals: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/r@lgcode/locals.scm",
        ],
      },
    },
    {
      filetype: "make",
      aliases: ["makefile"],
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter-grammars@lgcode/tree-sitter-make@lgcode/releases@lgcode/download@lgcode/v1.1.1@lgcode/tree-sitter-make.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/make@lgcode/highlights.scm",
        ],
      },
    },
    {
      filetype: "vim",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter-grammars@lgcode/tree-sitter-vim@lgcode/releases@lgcode/download@lgcode/v0.8.1@lgcode/tree-sitter-vim.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/vim@lgcode/highlights.scm",
        ],
        locals: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/vim@lgcode/locals.scm",
        ],
      },
    },
    {
      filetype: "xml",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter-grammars@lgcode/tree-sitter-xml@lgcode/releases@lgcode/download@lgcode/v0.7.0@lgcode/tree-sitter-xml.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/xml@lgcode/highlights.scm",
        ],
        locals: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/xml@lgcode/locals.scm",
        ],
      },
    },
    {
      filetype: "agda",
      wasm: "https:@lgcode/@lgcode/github.com@lgcode/tree-sitter@lgcode/tree-sitter-agda@lgcode/releases@lgcode/download@lgcode/v1.3.3@lgcode/tree-sitter-agda.wasm",
      queries: {
        highlights: [
          "https:@lgcode/@lgcode/raw.githubusercontent.com@lgcode/nvim-treesitter@lgcode/nvim-treesitter@lgcode/refs@lgcode/heads@lgcode/master@lgcode/queries@lgcode/agda@lgcode/highlights.scm",
        ],
      },
    },
  ],
}
