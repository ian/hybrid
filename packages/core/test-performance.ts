/**
 * Performance Test Script for XMTP Tools vs Direct Calls
 * 
 * This script compares the performance of XMTP tools (which go through JWT + HTTP)
 * vs direct XMTP client calls to identify the bottleneck causing 1-minute delays.
 */

declare const performance: {
	now(): number
}

async function mockJWTGeneration() {
	const startTime = performance.now()
	console.log("🔐 [Test] Starting JWT generation...")
	
	await new Promise(resolve => setTimeout(resolve, 5))
	
	const endTime = performance.now()
	console.log(`🔐 [Test] JWT generation completed in ${(endTime - startTime).toFixed(2)}ms`)
	return `mock-jwt-token-${Date.now()}`
}

async function mockHTTPRequest(endpoint: string, body?: any) {
	const startTime = performance.now()
	console.log(`🌐 [Test] Starting HTTP request to ${endpoint}`)
	
	await new Promise(resolve => setTimeout(resolve, 100))
	
	const endTime = performance.now()
	console.log(`🌐 [Test] HTTP request completed in ${(endTime - startTime).toFixed(2)}ms`)
	return { success: true, data: { conversationId: "mock-conversation" } }
}

async function mockDirectXMTPCall() {
	const startTime = performance.now()
	console.log("⚡ [Test] Starting direct XMTP call...")
	
	await new Promise(resolve => setTimeout(resolve, 50))
	
	const endTime = performance.now()
	console.log(`⚡ [Test] Direct XMTP call completed in ${(endTime - startTime).toFixed(2)}ms`)
	return { success: true, messageId: "mock-message-id" }
}

async function testToolBasedFlow() {
	const totalStartTime = performance.now()
	console.log("\n🔧 [Test] === Testing Tool-Based Flow ===")
	
	const token = await mockJWTGeneration()
	
	const clientStartTime = performance.now()
	console.log("🔧 [Test] Creating service client...")
	const clientEndTime = performance.now()
	console.log(`🔧 [Test] Service client created in ${(clientEndTime - clientStartTime).toFixed(2)}ms`)
	
	const httpResult = await mockHTTPRequest("/xmtp-tools/send", { content: "test message" })
	
	const endpointStartTime = performance.now()
	console.log("📨 [Test] Processing endpoint...")
	
	await new Promise(resolve => setTimeout(resolve, 2))
	console.log("📨 [Test] Token validation completed")
	
	await new Promise(resolve => setTimeout(resolve, 10))
	console.log("📨 [Test] Conversation lookup completed")
	
	await new Promise(resolve => setTimeout(resolve, 50))
	console.log("📨 [Test] XMTP send completed")
	
	const endpointEndTime = performance.now()
	console.log(`📨 [Test] Endpoint processing completed in ${(endpointEndTime - endpointStartTime).toFixed(2)}ms`)
	
	const totalEndTime = performance.now()
	console.log(`🔧 [Test] === Total Tool-Based Flow: ${(totalEndTime - totalStartTime).toFixed(2)}ms ===\n`)
	
	return totalEndTime - totalStartTime
}

async function testDirectFlow() {
	const totalStartTime = performance.now()
	console.log("⚡ [Test] === Testing Direct Flow ===")
	
	const result = await mockDirectXMTPCall()
	
	const totalEndTime = performance.now()
	console.log(`⚡ [Test] === Total Direct Flow: ${(totalEndTime - totalStartTime).toFixed(2)}ms ===\n`)
	
	return totalEndTime - totalStartTime
}

async function runPerformanceComparison() {
	console.log("🚀 [Test] Starting XMTP Performance Comparison Test")
	console.log("=" .repeat(60))
	
	const toolTime = await testToolBasedFlow()
	
	const directTime = await testDirectFlow()
	
	console.log("📊 [Test] === Performance Analysis ===")
	console.log(`Tool-based flow: ${toolTime.toFixed(2)}ms`)
	console.log(`Direct flow: ${directTime.toFixed(2)}ms`)
	console.log(`Overhead: ${(toolTime - directTime).toFixed(2)}ms (${((toolTime / directTime - 1) * 100).toFixed(1)}% slower)`)
	
	if (toolTime > directTime * 10) {
		console.log("🚨 [Test] SIGNIFICANT PERFORMANCE ISSUE DETECTED!")
		console.log("🔍 [Test] The tool-based flow is >10x slower than direct calls")
		console.log("💡 [Test] Likely bottlenecks to investigate:")
		console.log("   - HTTP request timeouts or retries")
		console.log("   - XMTP client initialization per request")
		console.log("   - Database/conversation lookup performance")
		console.log("   - Network latency to XMTP service")
	} else {
		console.log("✅ [Test] Performance overhead is within expected range")
	}
}


export { runPerformanceComparison, testToolBasedFlow, testDirectFlow }
