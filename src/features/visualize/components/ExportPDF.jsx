/**
 * PDF Export Utility for Dashboard
 * Exports the dashboard content as a printable PDF
 */

export const exportDashboardAsPDF = (contentRef, fileName) => {
    const printContent = contentRef?.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert('Please allow popups to export PDF');
        return;
    }

    const content = printContent.innerHTML;
    const currentDate = new Date().toLocaleString();

    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Dashboard Report - ${fileName}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
                
                * { margin: 0; padding: 0; box-sizing: border-box; }
                
                body { 
                    background: linear-gradient(135deg, #0a0a0a 0%, #111111 50%, #0a0a0a 100%);
                    color: #fff; 
                    font-family: 'Inter', system-ui, sans-serif;
                    min-height: 100vh;
                    position: relative;
                }
                
                /* Watermark */
                .watermark {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-30deg);
                    font-size: 120px;
                    font-weight: 700;
                    color: rgba(16, 185, 129, 0.03);
                    white-space: nowrap;
                    pointer-events: none;
                    z-index: 0;
                    letter-spacing: 20px;
                }
                
                /* Header */
                .header {
                    background: linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%);
                    padding: 30px 40px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    position: relative;
                    z-index: 1;
                }
                
                .brand {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                }
                
                .logo {
                    width: 48px;
                    height: 48px;
                    background: #000;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 26px;
                    font-weight: 800;
                    color: #fff;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.4);
                    border: 2px solid rgba(255,255,255,0.2);
                }
                
                .brand-text h2 {
                    font-size: 22px;
                    font-weight: 700;
                    color: white;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.2);
                }
                
                .brand-text p {
                    font-size: 11px;
                    color: rgba(255,255,255,0.8);
                    text-transform: uppercase;
                    letter-spacing: 2px;
                }
                
                .report-info {
                    text-align: right;
                    color: white;
                }
                
                .report-info h1 {
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 5px;
                }
                
                .report-info p {
                    font-size: 11px;
                    opacity: 0.9;
                }
                
                /* Main Content */
                .main {
                    padding: 30px 40px;
                    position: relative;
                    z-index: 1;
                }
                
                .content {
                    background: rgba(20, 20, 20, 0.95);
                    border: 1px solid rgba(16, 185, 129, 0.2);
                    border-radius: 16px;
                    padding: 25px;
                }
                
                /* KPI Cards Grid */
                .content > div:first-child {
                    display: grid;
                    grid-template-columns: repeat(6, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }
                
                /* KPI Card Styling */
                .content > div:first-child > div {
                    border-radius: 12px;
                    padding: 20px;
                    color: white;
                }
                .content > div:first-child > div:nth-child(1) { background: linear-gradient(135deg, #059669, #10b981); }
                .content > div:first-child > div:nth-child(2) { background: linear-gradient(135deg, #2563eb, #3b82f6); }
                .content > div:first-child > div:nth-child(3) { background: linear-gradient(135deg, #7c3aed, #8b5cf6); }
                .content > div:first-child > div:nth-child(4) { background: linear-gradient(135deg, #ea580c, #f97316); }
                .content > div:first-child > div:nth-child(5) { background: linear-gradient(135deg, #dc2626, #ef4444); }
                .content > div:first-child > div:nth-child(6) { background: linear-gradient(135deg, #db2777, #ec4899); }
                
                .content > div:first-child > div p:first-child {
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    opacity: 0.8;
                    margin-bottom: 6px;
                }
                
                .content > div:first-child > div p:nth-child(2) {
                    font-size: 28px;
                    font-weight: 700;
                }
                
                /* Footer - At page end */
                .footer {
                    margin-top: 30px;
                    background: linear-gradient(to right, #0a0a0a, #111, #0a0a0a);
                    border-top: 1px solid rgba(16, 185, 129, 0.3);
                    padding: 20px 40px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 15px;
                }
                
                @media print {
                    body { 
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    .watermark { display: block; }
                }
            </style>
        </head>
        <body>
            <!-- Watermark -->
            <div class="watermark">RELYCE AI</div>
            
            <!-- Header -->
            <div class="header">
                <div class="brand">
                    <div class="logo">R</div>
                    <div class="brand-text">
                        <h2>Relyce AI</h2>
                        <p>Data Visualization</p>
                    </div>
                </div>
                <div class="report-info">
                    <h1>📊 ${fileName}</h1>
                    <p>${currentDate}</p>
                </div>
            </div>
            
            <!-- Main Content -->
            <div class="main">
                <div class="content">
                    ${content}
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <div style="width: 28px; height: 28px; background: #000; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: #fff;">R</div>
                <span style="color: #10b981; font-size: 14px; font-weight: 600;">Powered by Relyce AI</span>
                <span style="color: #666; font-size: 11px; margin-left: 15px;">www.relyceinfotech.com</span>
            </div>
            
            <script>
                setTimeout(() => {
                    window.print();
                    window.close();
                }, 800);
            </script>
        </body>
        </html>
    `);
    printWindow.document.close();
};

export default exportDashboardAsPDF;
