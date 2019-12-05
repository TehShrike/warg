# 2.0.0

The TypeScript rewrite!  Technically comes with a breaking change, though in practice I doubt it will matter to anyone.

- Feature: TypeScript support
- Breaking: arguments to `value` are no longer optional
	- previously they defaulted to null
	- technically if you're using vanilla JS it just defaults to undefined if you don't pass anything in

# 1.2.2

- Fix: add an empty `.npmignore` so that the ESM entry point actually gets published :-|

# 1.2.1

- Fix: move `jsmd` from `dependencies` to `devDependencies`

# 1.2.0

- Feature: ESM entry point now exposed using `pkg.module`
