import { htmlToMarkdown } from '../index';

describe('htmlToMarkdown Real-World Scenarios', () => {
  describe('Corporate Website Link Patterns', () => {
    it('should handle corporate website with JavaScript navigation and PDF links', () => {
      const baseUrl = 'https://corporate.example.com';
      const html = `
        <html>
          <head><title>Reports</title></head>
          <body>
            <header>
              <nav>
                <a href="javascript:void(0);">Menu</a>
                <a href="javascript:showMenu()">Services</a>
              </nav>
            </header>
            <main>
              <h1>Financial Reports</h1>
              <div class="search-section">
                <h3>Search Suggestions</h3>
                <ul>
                  <li><a href="javascript:void(0);">Reports and Documents</a></li>
                  <li><a href="javascript:void(0);">Search History</a></li>
                </ul>
              </div>
              <div class="document-list">
                <h2>Available Reports</h2>
                <table>
                  <tr>
                    <td><a href="/documents/reports/report-2025-06.pdf">Monthly Report June 2025</a></td>
                    <td>Published: 09-06-2025</td>
                  </tr>
                  <tr>
                    <td><a href="/files/reports/report-2025-05.pdf">Monthly Report May 2025</a></td>
                    <td>Published: 19-05-2025</td>
                  </tr>
                  <tr>
                    <td><a href="../archive/report-2025-04.pdf">Previous Report</a></td>
                    <td>Published: 15-04-2025</td>
                  </tr>
                </table>
                <div class="actions">
                  <button onclick="downloadAll()">Download All</button>
                  <a href="javascript:printPage();">Print Page</a>
                </div>
              </div>
            </main>
            <footer>
              <p>Cookie Policy</p>
              <a href="javascript:acceptCookies();">Accept</a>
            </footer>
          </body>
        </html>
      `;

      const result = htmlToMarkdown(html, baseUrl);

      // Should filter out all JavaScript links
      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('showMenu()');
      expect(result).not.toContain('downloadAll()');
      expect(result).not.toContain('printPage()');
      expect(result).not.toContain('acceptCookies()');

      // Should preserve text content from JavaScript links in main content areas
      // Note: Navigation elements are completely filtered out by design
      expect(result).toContain('Reports and Documents');
      expect(result).toContain('Search History');
      expect(result).toContain('Print Page');
      // Note: "Accept" is in footer which gets filtered out by design

      // Should convert PDF links to absolute URLs
      expect(result).toContain('[Monthly Report June 2025](https://corporate.example.com/documents/reports/report-2025-06.pdf)');
      expect(result).toContain('[Monthly Report May 2025](https://corporate.example.com/files/reports/report-2025-05.pdf)');
      expect(result).toContain('[Previous Report](https://corporate.example.com/archive/report-2025-04.pdf)');

      // Should preserve main content structure
      expect(result).toContain('# Financial Reports');
      expect(result).toContain('## Available Reports');
      expect(result).toContain('### Search Suggestions');

      // Should filter out navigation and footer elements
      expect(result).not.toContain('Cookie Policy');
    });

    it('should handle corporate website with Thai content', () => {
      const baseUrl = 'https://www.company.co.th';
      const html = `
        <div>
          <div class="search-hints">
            <h3>คำค้นหาที่แนะนำ</h3>
            <ul>
              <li><a href="javascript:void(0);">รายงานและเอกสาร</a></li>
            </ul>
            <h3>คำที่คุณใช้ค้นหาล่าสุด</h3>
            <ul>
              <li><a href="javascript:void(0);">Last Search</a></li>
              <li><a href="/th/corporate/reports/document-detail.html#search-result-option-0">All()</a></li>
            </ul>
          </div>
          <div class="content">
            <h2>รายงานประจำไตรมาสย้อนหลัง</h2>
            <div class="document-links">
              <a href="/content/media/corporate/reports/documents/2025/report68-10.pdf">รายงานประจำไตรมาส</a> วันที่มีผล: 09-06-2568
              <br>
              <a href="/content/media/corporate/reports/documents/2025/report68-09.pdf">รายงานประจำไตรมาส</a> วันที่มีผล: 19-05-2568
            </div>
          </div>
          <div class="cookie-banner">
            <p>การใช้และการจัดการคุกกี้</p>
            <a href="javascript:void(0);">ยอมรับ</a>
          </div>
        </div>
      `;

      const result = htmlToMarkdown(html, baseUrl);

      // Should filter JavaScript links
      expect(result).not.toContain('javascript:void(0)');

      // Should preserve Thai text content
      expect(result).toContain('รายงานและเอกสาร');
      expect(result).toContain('ยอมรับ');

      // Should convert PDF links correctly
      expect(result).toContain('[รายงานประจำไตรมาส](https://www.company.co.th/content/media/corporate/reports/documents/2025/report68-10.pdf)');
      expect(result).toContain('[รายงานประจำไตรมาส](https://www.company.co.th/content/media/corporate/reports/documents/2025/report68-09.pdf)');

      // Should preserve valid links with fragments
      expect(result).toContain('[All()](https://www.company.co.th/th/corporate/reports/document-detail.html#search-result-option-0)');
    });

    it('should handle corporate dropdown menus and forms', () => {
      const baseUrl = 'https://www.company.co.th';
      const html = `
        <div class="report-selector">
          <h2>รายงานบริษัท</h2>
          <div class="dropdown">
            <label>ประกาศย้อนหลัง</label>
            <select onchange="javascript:loadReports(this.value)">
              <option value="">กรุณาเลือก</option>
              <option value="22may2025">22 พฤษภาคม 2568</option>
              <option value="15may2025">15 พฤษภาคม 2568</option>
            </select>
          </div>
          <div class="report-table">
            <table>
              <tr>
                <td>ตารางที่ 1 รายงานประจำไตรมาส</td>
                <td><a href="/assets/web-resources/pdf/corporate/announcement/1quarterly-reports/2025/22may2025-th.pdf">22 พฤษภาคม 2568</a></td>
              </tr>
            </table>
          </div>
          <div class="form-actions">
            <button type="button" onclick="javascript:submitForm()">ส่งข้อมูล</button>
            <a href="javascript:resetForm();">รีเซ็ต</a>
          </div>
        </div>
      `;

      const result = htmlToMarkdown(html, baseUrl);

      // Should filter JavaScript in onclick and href
      expect(result).not.toContain('javascript:loadReports');
      expect(result).not.toContain('javascript:submitForm');
      expect(result).not.toContain('javascript:resetForm');

      // Should preserve form text content
      expect(result).toContain('ส่งข้อมูล');
      expect(result).toContain('รีเซ็ต');

      // Should convert PDF link correctly
      expect(result).toContain('[22 พฤษภาคม 2568](https://www.company.co.th/assets/web-resources/pdf/corporate/announcement/1quarterly-reports/2025/22may2025-th.pdf)');

      // Should preserve table structure
      expect(result).toContain('ตารางที่ 1 รายงานประจำไตรมาส');
    });
  });

  describe('Complex JavaScript Link Variations', () => {
    it('should filter various JavaScript link patterns', () => {
      const baseUrl = 'https://example.com';
      const html = `
        <div>
          <a href="javascript:void(0);">Void Link</a>
          <a href="javascript:;">Short JS</a>
          <a href="javascript:alert('test');">Alert Link</a>
          <a href="javascript:window.open('popup.html')">Popup Link</a>
          <a href="javascript:document.getElementById('form').submit()">Submit Link</a>
          <a href="JAVASCRIPT:VOID(0);">Uppercase JS</a>
          <a href="javascript:void(0);">Spaced JS</a>
          <a href="https://example.com/valid">Valid Link</a>
          <a href="/document.pdf">PDF Link</a>
        </div>
      `;

      const result = htmlToMarkdown(html, baseUrl);

      // Should filter all JavaScript variations (links should not contain href URLs)
      expect(result).not.toMatch(/\[.*?\]\(javascript:/);
      expect(result).not.toMatch(/\[.*?\]\(JAVASCRIPT:/);
      expect(result).not.toContain('](javascript:void(0))');
      expect(result).not.toContain('](javascript:;)');
      expect(result).not.toContain('](javascript:alert');
      expect(result).not.toContain('](javascript:window.open');
      expect(result).not.toContain('](javascript:document.getElementById');

      // Should preserve all text content
      expect(result).toContain('Void Link');
      expect(result).toContain('Short JS');
      expect(result).toContain('Alert Link');
      expect(result).toContain('Popup Link');
      expect(result).toContain('Submit Link');
      expect(result).toContain('Uppercase JS');
      expect(result).toContain('Spaced JS');

      // Should preserve valid links
      expect(result).toContain('[Valid Link](https://example.com/valid)');
      expect(result).toContain('[PDF Link](https://example.com/document.pdf)');
    });

    it('should handle JavaScript links with special characters and encoding', () => {
      const baseUrl = 'https://example.com';
      const html = `
        <div>
          <a href="javascript:showDetails('รายละเอียด');">Thai Text Action</a>
          <a href="javascript:navigate(&quot;/page&quot;);">Encoded Quotes</a>
          <a href="javascript:processData({id: 123, name: 'test'});">JSON Data</a>
          <a href="javascript:void(0); return false;">Complex JS</a>
          <a href="mailto:test@example.com">Email Link</a>
          <a href="tel:+66123456789">Phone Link</a>
        </div>
      `;

      const result = htmlToMarkdown(html, baseUrl);

      // Should filter all JavaScript links regardless of content
      expect(result).not.toContain('javascript:showDetails');
      expect(result).not.toContain('javascript:navigate');
      expect(result).not.toContain('javascript:processData');
      expect(result).not.toContain('javascript:void(0); return false');

      // Should preserve text with special characters
      expect(result).toContain('Thai Text Action');
      expect(result).toContain('Encoded Quotes');
      expect(result).toContain('JSON Data');
      expect(result).toContain('Complex JS');

      // Should preserve non-JavaScript protocol links
      expect(result).toContain('[Email Link](mailto:test@example.com)');
      expect(result).toContain('[Phone Link](tel:+66123456789)');
    });
  });

  describe('Document Link Processing', () => {
    it('should handle various document formats with absolute URL conversion', () => {
      const baseUrl = 'https://example.com/corporate/documents/';
      const html = `
        <div class="documents">
          <h2>Available Documents</h2>
          <table>
            <tr>
              <td><a href="./2025/reports-june.pdf">June 2025 Reports</a></td>
              <td><a href="../archive/reports-may.xlsx">May Excel File</a></td>
            </tr>
            <tr>
              <td><a href="/global/documents/annual-report.doc">Annual Report</a></td>
              <td><a href="https://cdn.example.com/files/presentation.pptx">External PPT</a></td>
            </tr>
            <tr>
              <td><a href="//files.example.com/data.zip">Protocol Relative</a></td>
              <td><a href="javascript:downloadFile('reports.pdf');">JS Download</a></td>
            </tr>
          </table>
        </div>
      `;

      const result = htmlToMarkdown(html, baseUrl);

      // Should convert relative paths correctly
      expect(result).toContain('[June 2025 Reports](https://example.com/corporate/documents/2025/reports-june.pdf)');
      expect(result).toContain('[May Excel File](https://example.com/corporate/archive/reports-may.xlsx)');

      // Should convert absolute paths correctly
      expect(result).toContain('[Annual Report](https://example.com/global/documents/annual-report.doc)');

      // Should preserve external absolute URLs
      expect(result).toContain('[External PPT](https://cdn.example.com/files/presentation.pptx)');

      // Should handle protocol-relative URLs
      expect(result).toContain('[Protocol Relative](https://files.example.com/data.zip)');

      // Should filter JavaScript download but preserve text
      expect(result).not.toContain('javascript:downloadFile');
      expect(result).toContain('JS Download');
    });

    it('should preserve query parameters and fragments in document links', () => {
      const baseUrl = 'https://company.example.com';
      const html = `
        <div>
          <a href="/documents/reports.pdf?version=2&format=detailed">Detailed Reports</a>
          <a href="/reports/annual.pdf#section-3">Annual Report Section 3</a>
          <a href="./files/data.xlsx?download=true&token=abc123">Secure Download</a>
          <a href="javascript:openDoc('/reports.pdf?popup=true');">JS PDF Open</a>
        </div>
      `;

      const result = htmlToMarkdown(html, baseUrl);

      // Should preserve query parameters
      expect(result).toContain('[Detailed Reports](https://company.example.com/documents/reports.pdf?version=2&format=detailed)');
      expect(result).toContain('[Secure Download](https://company.example.com/files/data.xlsx?download=true&token=abc123)');

      // Should preserve fragments
      expect(result).toContain('[Annual Report Section 3](https://company.example.com/reports/annual.pdf#section-3)');

      // Should filter JavaScript but preserve text
      expect(result).not.toContain('javascript:openDoc');
      expect(result).toContain('JS PDF Open');
    });
  });

  describe('Content Structure Preservation', () => {
    it('should maintain heading hierarchy while filtering navigation', () => {
      const baseUrl = 'https://example.com';
      const html = `
        <html>
          <header>
            <h1>Site Header</h1>
            <nav>
              <a href="javascript:toggleMenu();">Menu</a>
            </nav>
          </header>
          <main>
            <h1>Main Page Title</h1>
            <section>
              <h2>Company Reports</h2>
              <h3>Current Reports</h3>
              <p>Report information here</p>
              <a href="/reports.pdf">Download Reports</a>
            </section>
          </main>
          <aside>
            <h4>Quick Links</h4>
            <a href="javascript:void(0);">Calculator</a>
          </aside>
          <footer>
            <h5>Footer Info</h5>
          </footer>
        </html>
      `;

      const result = htmlToMarkdown(html, baseUrl);

      // Should preserve main content headings
      expect(result).toContain('# Main Page Title');
      expect(result).toContain('## Company Reports');
      expect(result).toContain('### Current Reports');

      // Should filter out navigation elements
      expect(result).not.toContain('Site Header');
      expect(result).not.toContain('Quick Links');
      expect(result).not.toContain('Footer Info');
      expect(result).not.toContain('javascript:toggleMenu');
      expect(result).not.toContain('javascript:void(0)');

      // Should preserve main content
      expect(result).toContain('Report information here');
      expect(result).toContain('[Download Reports](https://example.com/reports.pdf)');
    });

    it('should handle mixed content with scripts and styles removed', () => {
      const baseUrl = 'https://example.com';
      const html = `
        <html>
          <head>
            <script>
              function trackEvent() {
                // Analytics code
              }
            </script>
            <style>
              .hidden { display: none; }
            </style>
          </head>
          <body>
            <div>
              <h2>Financial Reports</h2>
              <script>trackEvent('page_view');</script>
              <p>Download our latest reports:</p>
              <ul>
                <li><a href="/q1-2025.pdf" onclick="trackEvent('download');">Q1 2025 Report</a></li>
                <li><a href="javascript:requestReport('q2');">Request Q2 Report</a></li>
              </ul>
              <style>.popup { z-index: 999; }</style>
            </div>
          </body>
        </html>
      `;

      const result = htmlToMarkdown(html, baseUrl);

      // Should remove scripts and styles completely
      expect(result).not.toContain('function trackEvent');
      expect(result).not.toContain('trackEvent(');
      expect(result).not.toContain('display: none');
      expect(result).not.toContain('z-index: 999');

      // Should preserve content structure
      expect(result).toContain('## Financial Reports');
      expect(result).toContain('Download our latest reports:');

      // Should handle links correctly
      expect(result).toContain('[Q1 2025 Report](https://example.com/q1-2025.pdf)');
      expect(result).not.toContain('javascript:requestReport');
      expect(result).toContain('Request Q2 Report');
    });
  });
});