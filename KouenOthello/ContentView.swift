import SwiftUI
import WebKit

struct ContentView: View {
    var body: some View { GameWebView().ignoresSafeArea() }
}

private struct GameWebView: UIViewRepresentable {
    func makeCoordinator() -> Coordinator { Coordinator() }
    func makeUIView(context: Context) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.userContentController.add(context.coordinator, name: "haptic")
        let view = WKWebView(frame: .zero, configuration: config)
        view.isOpaque = false; view.scrollView.bounces = false
        if let url = Bundle.main.url(forResource: "index", withExtension: "html", subdirectory: "Web") {
            view.loadFileURL(url, allowingReadAccessTo: url.deletingLastPathComponent())
        }
        return view
    }
    func updateUIView(_ uiView: WKWebView, context: Context) {}
    final class Coordinator: NSObject, WKScriptMessageHandler {
        func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
            UIImpactFeedbackGenerator(style: .soft).impactOccurred()
        }
    }
}
