from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            storage_state="auth_state.json",
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()
        print("Navigating to Chat Page...")
        
        page.goto("http://localhost:5173/chat", wait_until="networkidle", timeout=30000)
        page.wait_for_timeout(3000)  # Let any animations settle
        
        screenshot_path = "chat_page_preview.png"
        page.screenshot(path=screenshot_path)
        print(f"Screenshot saved to {screenshot_path}")
        
        browser.close()

if __name__ == "__main__":
    run()
