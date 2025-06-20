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

  it('should convert text formatting tags', () => {
    const html = '<strong>Strong</strong> <b>bold</b> <em>emphasis</em> <i>italic</i>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('**Strong** **bold** *emphasis* *italic*');
  });

  it('should convert links', () => {
    const html = '<a href="https://example.com">Example Link</a>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('[Example Link](https://example.com)');
  });

  it('should convert images with and without alt text', () => {
    const htmlWithAlt = '<img src="image.jpg" alt="Alt text">';
    const htmlWithoutAlt = '<img src="image.jpg">';
    
    expect(htmlToMarkdown(htmlWithAlt)).toBe('![Alt text](image.jpg)');
    expect(htmlToMarkdown(htmlWithoutAlt)).toBe('![](image.jpg)');
  });

  it('should convert both unordered and ordered lists', () => {
    const unorderedHtml = '<ul><li>Item 1</li><li>Item 2</li></ul>';
    const orderedHtml = '<ol><li>First</li><li>Second</li></ol>';
    
    expect(htmlToMarkdown(unorderedHtml)).toBe('- Item 1\n- Item 2');
    expect(htmlToMarkdown(orderedHtml)).toBe('- First\n- Second');
  });

  it('should convert blockquotes', () => {
    const html = '<blockquote>This is a quote</blockquote>';
    const result = htmlToMarkdown(html);
    expect(result).toBe('> This is a quote');
  });

  it('should convert inline code and code blocks', () => {
    const inlineHtml = 'Use <code>console.log()</code> to debug';
    const blockHtml = '<pre>function hello() {\n  console.log("Hello");\n}</pre>';
    
    expect(htmlToMarkdown(inlineHtml)).toBe('Use `console.log()` to debug');
    expect(htmlToMarkdown(blockHtml)).toBe('function hello() {\n  console.log("Hello");\n}');
  });

  describe('content filtering', () => {
    it('should remove unwanted HTML elements', () => {
      const testCases = [
        ['<p>Content</p><script>alert("bad")</script><p>More</p>', 'Content\n\nMore'],
        ['<p>Content</p><style>body { color: red; }</style><p>More</p>', 'Content\n\nMore'],
        ['<nav>Navigation</nav><p>Content</p>', 'Content'],
        ['<header>Header</header><p>Content</p>', 'Content'],
        ['<p>Content</p><footer>Footer</footer>', 'Content'],
        ['<p>Content</p><aside>Sidebar</aside>', 'Content']
      ];

      testCases.forEach(([html, expected]) => {
        expect(htmlToMarkdown(html)).toBe(expected);
      });
    });
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

  describe('edge cases', () => {
    it('should handle special inputs correctly', () => {
      expect(htmlToMarkdown('')).toBe('');
      expect(htmlToMarkdown('Just plain text')).toBe('Just plain text');
    });

    it('should normalize excessive newlines', () => {
      const html = '<p>Para 1</p>\n\n\n<p>Para 2</p>';
      expect(htmlToMarkdown(html)).toBe('Para 1\n\nPara 2');
    });
  });
});