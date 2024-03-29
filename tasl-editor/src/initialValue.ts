export const initialValue = `# This is a tasl schema!
namespace s http://schema.org/

# classes are like tables, except they
# can be arbitrary algebraic data types,
# not just columns of primitives.
class s:Person {
  s:name -> string
  s:email -> uri
  s:gender -> [
    s:Male
    s:Female
    s:value <- string
  ]
}

# references are a primitive type that
# point to other classes in the schema,
# just like foreign keys.
class s:Book {
  s:name -> string
  s:isbn -> uri
  s:author -> * s:Person
}`
