import { BiomeOptions } from "projen/lib/javascript";
import { IndentStyle, QuoteStyle, TrailingCommas, VcsClientKind } from "projen/lib/javascript/biome/biome-config";

export const biomeOptions: BiomeOptions = {
    biomeConfig: {
      vcs: {
        enabled: true,
        clientKind:    VcsClientKind.GIT,
        useIgnoreFile: true,
      },
      files: {
        ignoreUnknown: true,
      },
      formatter: {
        indentStyle: IndentStyle.SPACE,
      },
      assist: {
        actions: {
          source: {
            organizeImports: 'on',
          },
        },
      },
      linter: {
        rules: {
          recommended: true,
          style: {
            noParameterAssign: 'error',
            useAsConstAssertion: 'error',
            useDefaultParameterLast: 'error',
            useEnumInitializers: 'error',
            useSelfClosingElements: 'error',
            useSingleVarDeclarator: 'error',
            noUnusedTemplateLiteral: 'error',
            useNumberNamespace: 'error',
            noInferrableTypes: 'error',
            noUselessElse: 'error',
          },
        },
      },
      javascript: {
        formatter: {
          quoteStyle: QuoteStyle.SINGLE,
          trailingCommas: TrailingCommas.ES5,
          bracketSpacing: true,
          lineWidth: 120,
        },
      },
    },
  }