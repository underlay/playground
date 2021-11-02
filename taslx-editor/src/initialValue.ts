export const initialValue = `# example.taslx
namespace ul http://underlay.org/ns/

map ex:target <= ex:source (s) => <ipfs:QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn>

map ex:target <= ex:source (source) => {
  # Some stuff here
  ex:a <= s * ex:foo / ex:bar
  ex:b <= s / ex:baz [
    ex:foo (x) => x % ex:foo
    ex:bar (x) => x % ex:bar
  ] % ex:more % ex:stuff
  ex:c <= "hello world"
} % ex:bar % ex:baz`
