// This is an ECMAScript module, so it can only be loaded asynchronously.

export default {
	plugins: [
		"@babel/transform-arrow-functions",
		["@babel/syntax-pipeline-operator", { proposal: "fsharp" }]
	]
}