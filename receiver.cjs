const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const FILE_PATH = path.join(__dirname, 'slides.md');

const server = http.createServer((req, res) => {
    if (req.method === 'POST') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const data = JSON.parse(body);
                let raw = (data.output || "").replace(/\\n/g, '\n').replace(/```markdown/gi, '').replace(/```/gi, '').trim();
                
                // 1. 提取文字，干掉所有干扰项
                let cleanLines = raw.split('\n').filter(line => {
                    let l = line.trim().toLowerCase();
                    return l !== "" && l !== "---" && !l.startsWith("layout:") && !l.startsWith("background:");
                });

                let fullText = cleanLines.join('\n');
                let sections = fullText.split(/(?=# )/g).filter(s => s.trim().length > 0);

                let finalizedMarkdown = "";
                const fallbackKws = ["tech", "business", "tokyo", "office", "innovation", "digital"];

                sections.forEach((section, index) => {
                    const kw = fallbackKws[index % fallbackKws.length];
                    // 加上随机数并确保 URL 纯净
                    const bgUrl = `https://loremflickr.com/1200/800/${kw}?lock=${Math.floor(Math.random() * 1000) + index}`;
                    
                    // 全部强制使用 cover 布局
                    finalizedMarkdown += `---\n`;
                    finalizedMarkdown += `layout: cover\n`;
                    finalizedMarkdown += `background: '${bgUrl}'\n`; // 必须有单引号
                    finalizedMarkdown += `---\n\n`; // 确保没有尾部空格
                    finalizedMarkdown += section.trim() + "\n\n";
                });

                fs.writeFileSync(FILE_PATH, finalizedMarkdown.trim(), 'utf8');
                console.log(`🎯 终极绝杀！${sections.length} 页已强制格式化。`);
                res.writeHead(200).end('OK');

            } catch (err) {
                res.writeHead(500).end('Error');
            }
        });
    }
});

server.listen(PORT, () => console.log(`🚀 终极版启动：3001`));