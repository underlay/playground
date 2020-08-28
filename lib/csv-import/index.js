const main = document.querySelector("main");
const tabs = [".tsv", "text/tsv", "text/tab-separated-values"];
const commas = [".csv", "text/csv"];
const accept = tabs.concat(commas).join(",");
function parse(text, headers) {
    const result = Papa.parse(text, {
        header: headers,
        skipEmptyLines: "greedy",
    });
    return result;
}
const previewLines = 10;
const namespacePattern = /^[a-z0-9]+:(?:\/[A-Za-z0-9-._:]*)*[A-Za-z0-9-._:]+(?:\/|#)$/;
const namespacePatternURL = "https://regexper.com/#" + encodeURIComponent(namespacePattern.source);
const propertyPattern = /^[a-z0-9]+:(?:\/[A-Za-z0-9-._:]*)*[A-Za-z0-9-._:]+(?:\/|#)[A-Za-z0-9-._]+$/;
const propertyPatternURL = "https://regexper.com/#" + encodeURIComponent(propertyPattern.source);
const initialSubjectUri = "http://example.com/foo";
function Index() {
    const [table, setTable] = React.useState(null);
    const handleTableChange = React.useCallback((table) => setTable(table), []);
    const [subjectUri, setSubjectUri] = React.useState(initialSubjectUri);
    const [focus, setFocus] = React.useState(NaN);
    const [uris, setUris] = React.useState(null);
    return (React.createElement(React.Fragment, null,
        React.createElement(Step1, { focus: focus, onChange: handleTableChange }),
        table !== null && table.errors.length === 0 && (React.createElement(Step2, { onChange: setSubjectUri })),
        table !== null &&
            table.errors.length === 0 &&
            propertyPattern.test(subjectUri) && (React.createElement(Step3, { table: table, onFocus: setFocus, onChange: setUris })),
        table !== null &&
            table.errors.length === 0 &&
            propertyPattern.test(subjectUri) &&
            uris !== null && (React.createElement(Step4, { subjectUri: subjectUri, table: table, uris: uris }))));
}
function Step1(props) {
    const input = React.useRef(null);
    const [text, setText] = React.useState(null);
    const onFileChange = React.useCallback(async (_) => {
        if (input.current !== null && input.current.files !== null) {
            const file = input.current.files.item(0);
            if (file !== null) {
                file.text().then(setText);
            }
            else {
                setText(null);
            }
        }
    }, []);
    const [headers, setHeaders] = React.useState(true);
    const onIsHeaderChange = React.useCallback(({ target: { checked } }) => setHeaders(checked), []);
    const result = React.useMemo(() => {
        return text === null ? null : parse(text, headers);
    }, [text, headers]);
    React.useEffect(() => props.onChange(result), [result]);
    return (React.createElement("section", { className: "file" },
        React.createElement("h2", null, "Step 1: select the file"),
        React.createElement("form", null,
            React.createElement("label", null,
                React.createElement("span", null, "Drag and drop your CSV or TSV, or select a file:"),
                React.createElement("input", { ref: input, type: "file", accept: accept, multiple: false, onChange: onFileChange })),
            React.createElement("br", null),
            React.createElement("label", null,
                React.createElement("span", null, "The first line is a header:"),
                React.createElement("input", { type: "checkbox", checked: headers, onChange: onIsHeaderChange }))),
        result && (React.createElement(React.Fragment, null,
            "Preview:",
            React.createElement(Preview, { result: result, focus: props.focus })))));
}
function Preview({ result, focus }) {
    if (result.errors.length > 0) {
        return (React.createElement("div", { className: "preview error" },
            React.createElement("dl", null, result.errors.map((error, index) => (React.createElement(React.Fragment, { key: index.toString() },
                React.createElement("dt", null,
                    error.type,
                    ": ",
                    error.code,
                    " in row ",
                    error.row),
                React.createElement("dd", null, error.message)))))));
    }
    else if (Array.isArray(result.meta.fields)) {
        const data = result.data.slice(0, previewLines);
        return (React.createElement("div", { className: "preview" },
            React.createElement("table", null,
                React.createElement("tbody", null,
                    React.createElement("tr", { className: "header" }, result.meta.fields.map((field, j) => (React.createElement("th", { key: field, className: j === focus ? "focus" : undefined }, field)))),
                    data.map((row, i) => (React.createElement("tr", { key: i.toString() }, result.meta.fields.map((field, j) => (React.createElement("td", { key: field, className: j === focus ? "focus" : undefined }, row[field]))))))))));
    }
    else {
        const data = result.data.slice(0, previewLines);
        return (React.createElement("div", { className: "preview" },
            React.createElement("table", null,
                React.createElement("tbody", null, data.map((row, i) => (React.createElement("tr", { key: i.toString() }, row.map((cell, j) => (React.createElement("td", { key: j.toString(), className: j === focus ? "focus" : undefined }, cell))))))))));
    }
}
function Step2(props) {
    const [value, setValue] = React.useState(initialSubjectUri);
    const handleChange = React.useCallback(({ target: { value } }) => {
        setValue(value);
        if (propertyPattern.test(value)) {
            props.onChange(value);
        }
    }, []);
    return (React.createElement("section", { className: "columns" },
        React.createElement("h2", null, "Step 2: give the table with a URI type"),
        React.createElement("label", null,
            "This is the \"type\" or class of each row:",
            " ",
            React.createElement("input", { type: "text", placeholder: "http://example.com/...", pattern: propertyPattern.source, onChange: handleChange, value: value })),
        !propertyPattern.test(value) && (React.createElement("div", null,
            React.createElement(Validate, null)))));
}
function Step3(props) {
    const handleBlur = React.useCallback(({}) => props.onFocus(NaN), [
        props.onFocus,
    ]);
    const width = getWidth(props.table);
    const [uris, setUris] = React.useState(() => new Array(width).fill(""));
    const valid = React.useMemo(() => uris.map((uri) => propertyPattern.test(uri)), [uris]);
    React.useEffect(() => {
        if (valid.every((v) => v)) {
            props.onChange(uris);
        }
        else {
            props.onChange(null);
        }
    }, [uris, valid]); // should props be a dependency??
    return (React.createElement("section", { className: "columns" },
        React.createElement("h2", null, "Step 3: name the columns with URIs"),
        React.createElement(Namespace, { table: props.table, onSubmit: setUris }),
        React.createElement("table", null,
            React.createElement("tbody", null, uris.map((uri, index) => {
                const label = getLabel(index, props.table);
                const handleChange = ({ target: { value }, }) => {
                    const nextUris = [...uris];
                    nextUris[index] = value;
                    setUris(nextUris);
                };
                return (React.createElement("tr", { key: index.toString() },
                    React.createElement("td", null, label),
                    React.createElement("td", null,
                        React.createElement("input", { type: "text", placeholder: "http://example.com/...", pattern: propertyPattern.source, onFocus: ({}) => props.onFocus(index), onBlur: handleBlur, value: uri, onChange: handleChange }),
                        uri && !valid[index] && React.createElement(Validate, null))));
            })))));
}
function Validate({}) {
    const link = React.createElement("a", { href: propertyPatternURL }, "this");
    return (React.createElement("span", { className: "validate" },
        "(must be a valid URI matching ",
        link,
        " pattern)"));
}
function getWidth(table) {
    if (Array.isArray(table.meta.fields)) {
        return table.meta.fields.length;
    }
    else {
        const data = table.data;
        return data.reduce((width, { length }) => Math.max(width, length), 0);
    }
}
function getLabel(index, table) {
    if (Array.isArray(table.meta.fields)) {
        return React.createElement("span", null, table.meta.fields[index]);
    }
    else {
        return null;
    }
}
function Namespace(props) {
    const [namespace, setNamespace] = React.useState("http://example.com/");
    const onNamespaceChange = React.useCallback(({ target: { value } }) => setNamespace(value), []);
    const handleClick = React.useCallback(({}) => props.onSubmit(props.table.meta.fields.map((field) => namespace + field)), [props.table, props.onSubmit, namespace]);
    if (Array.isArray(props.table.meta.fields)) {
        const disabled = !namespacePattern.test(namespace);
        return (React.createElement(React.Fragment, null,
            React.createElement("label", { style: { display: "block" } },
                React.createElement("span", null, "Auto-fill by appending the headers to this namespace:"),
                React.createElement("input", { className: "namespace", type: "text", value: namespace, onChange: onNamespaceChange, placeholder: "http://example.com/", pattern: namespacePattern.source }),
                React.createElement("button", { onClick: handleClick, disabled: disabled }, "Go"),
                React.createElement("div", null,
                    "(must be a valid URI ending in / or #, matching",
                    " ",
                    React.createElement("a", { href: namespacePatternURL }, "this"),
                    " pattern)")),
            React.createElement("hr", null)));
    }
    else {
        return null;
    }
}
function makeSchema(subjectUri, uris) {
    const lines = [
        "[context]",
        'xsd = "http://www.w3.org/2001/XMLSchema#"\n',
        "[types]",
        `[types."${subjectUri}"]`,
        "components = {",
    ];
    for (const uri of uris) {
        lines.push(`\t"${uri}"\n\t\t= { datatype = "xsd:string" }`);
    }
    lines.push("}\n");
    return lines.join("\n");
}
function Step4(props) {
    const [objectURL, setObjectURL] = React.useState("");
    React.useEffect(() => {
        const quads = Array.from(generateQuads(props.table, props.subjectUri, props.uris));
        RdfCanonize.canonize(quads, { algorithm: "URDNA2015" }).then((dataset) => setObjectURL(URL.createObjectURL(new Blob([dataset], { type: "text/plain" }))));
    }, [props.subjectUri, props.table, props.uris]);
    const schemaObjectURL = React.useMemo(() => {
        const schema = makeSchema(props.subjectUri, props.uris);
        return URL.createObjectURL(new Blob([schema], { type: "text/plain" }));
    }, [props.subjectUri, props.uris]);
    return (React.createElement("section", { className: "download" },
        React.createElement("h2", null, "Step 4: download the files"),
        React.createElement("div", null,
            React.createElement("a", { href: schemaObjectURL }, "schema.toml")),
        React.createElement("div", null, objectURL === "" ? (React.createElement("span", null, "packaging...")) : (React.createElement("a", { href: objectURL }, "assertion.nq")))));
}
const defaultGraph = { termType: "DefaultGraph", value: "" };
const rdfType = {
    termType: "NamedNode",
    value: "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
};
const xsdString = {
    termType: "NamedNode",
    value: "http://www.w3.org/2001/XMLSchema#string",
};
function* generateQuads(table, subjectUri, uris) {
    const classTerm = { termType: "NamedNode", value: subjectUri };
    const propertyTerms = uris.map((value) => ({ termType: "NamedNode", value }));
    for (const [i, row] of table.data.entries()) {
        const entity = { termType: "BlankNode", value: `s-${i}` };
        yield {
            subject: entity,
            predicate: rdfType,
            object: classTerm,
            graph: defaultGraph,
        };
        for (const j of uris.keys()) {
            const value = Array.isArray(row) ? row[j] : row[table.meta.fields[j]];
            const term = {
                termType: "Literal",
                value: value || "",
                datatype: xsdString,
            };
            yield {
                subject: entity,
                predicate: propertyTerms[j],
                object: term,
                graph: defaultGraph,
            };
        }
    }
}
ReactDOM.render(React.createElement(Index, null), main);
