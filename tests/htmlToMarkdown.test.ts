import { htmlToMarkdown } from '../index';

describe('htmlToMarkdown', () => {
  it('should convert basic HTML tags to markdown', () => {
    const html = '<h1>Title</h1><p>This is a paragraph</p>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('# Title\n\nThis is a paragraph');
  });

  it('should convert headers of all levels', () => {
    const html = '<h1>H1</h1><h2>H2</h2><h3>H3</h3><h4>H4</h4><h5>H5</h5><h6>H6</h6>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('# H1\n\n## H2\n\n### H3\n\n#### H4\n\n##### H5\n\n###### H6');
  });

  it('should convert paragraphs correctly', () => {
    const html = '<p>First paragraph</p><p>Second paragraph</p>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('First paragraph\n\nSecond paragraph');
  });

  it('should convert line breaks', () => {
    const html = 'Line 1<br>Line 2<br/>Line 3';
    const result = htmlToMarkdown(html);
    expect(result).toBe('Line 1\nLine 2\nLine 3');
  });

  it('should convert bold and strong tags', () => {
    const html = '<strong>Strong text</strong> and <b>bold text</b>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('**Strong text** and **bold text**');
  });

  it('should convert italic and emphasis tags', () => {
    const html = '<em>Emphasized text</em> and <i>italic text</i>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('*Emphasized text* and *italic text*');
  });

  it('should convert links', () => {
    const html = '<a href="https://example.com">Example Link</a>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('[Example Link](https://example.com)');
  });

  it('should convert images with alt text', () => {
    const html = '<img src="image.jpg" alt="Alt text">';
    const result = htmlToMarkdown(html);
    expect(result).toBe('![Alt text](image.jpg)');
  });

  it('should convert images without alt text', () => {
    const html = '<img src="image.jpg">';
    const result = htmlToMarkdown(html);
    expect(result).toBe('![](image.jpg)');
  });

  it('should convert lists', () => {
    const html = '<ul><li>Item 1</li><li>Item 2</li></ul>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('- Item 1\n- Item 2');
  });

  it('should convert ordered lists', () => {
    const html = '<ol><li>First</li><li>Second</li></ol>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('- First\n- Second');
  });

  it('should convert blockquotes', () => {
    const html = '<blockquote>This is a quote</blockquote>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('> This is a quote');
  });

  it('should convert inline code', () => {
    const html = 'Use <code>console.log()</code> to debug';
    const result = htmlToMarkdown(html);
    expect(result).toBe('Use `console.log()` to debug');
  });

  it('should convert code blocks', () => {
    const html = '<pre>function hello() {\n  console.log("Hello");\n}</pre>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('function hello() {\n  console.log("Hello");\n}');
  });

  it('should remove script tags', () => {
    const html = '<p>Content</p><script>alert("bad")</script><p>More content</p>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('Content\n\nMore content');
  });

  it('should remove style tags', () => {
    const html = '<p>Content</p><style>body { color: red; }</style><p>More content</p>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('Content\n\nMore content');
  });

  it('should remove navigation elements', () => {
    const html = '<nav>Navigation</nav><p>Content</p>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('Content');
  });

  it('should remove header elements', () => {
    const html = '<header>Header</header><p>Content</p>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('Content');
  });

  it('should remove footer elements', () => {
    const html = '<p>Content</p><footer>Footer</footer>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('Content');
  });

  it('should remove aside elements', () => {
    const html = '<p>Content</p><aside>Sidebar</aside>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('Content');
  });

  it('should decode HTML entities', () => {
    const html = '<p>&amp; &lt; &gt; &quot; &#39; &nbsp;</p>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('& < > " \'');
  });

  it('should handle complex nested HTML', () => {
    const html = `
      <div>
        <h1>Main Title</h1>
        <p>This is a <strong>paragraph</strong> with <em>mixed</em> formatting.</p>
        <ul>
          <li>First item with <a href="https://example.com">a link</a></li>
          <li>Second item</li>
        </ul>
        <blockquote>
          <p>This is a quote with <code>inline code</code></p>
        </blockquote>
      </div>
    `;
    const result = htmlToMarkdown(html);
    expect(result).toContain('# Main Title');
    expect(result).toContain('**paragraph**');
    expect(result).toContain('*mixed*');
    expect(result).toContain('- First item');
    expect(result).toContain('[a link](https://example.com)');
    expect(result).toContain('This is a quote');
    expect(result).toContain('`inline code`');
  });

  it('should handle empty input', () => {
    const result = htmlToMarkdown('');
    expect(result).toBe('');
  });

  it('should handle plain text', () => {
    const result = htmlToMarkdown('Just plain text');
    expect(result).toBe('Just plain text');
  });

  it('should normalize excessive newlines', () => {
    const html = '<p>Para 1</p>\n\n\n<p>Para 2</p>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('Para 1\n\nPara 2');
  });
});