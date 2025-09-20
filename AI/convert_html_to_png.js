// 这个脚本用于将HTML示意图转换为PNG图片
// 需要安装puppeteer: npm install puppeteer

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function convertHtmlToPng() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  const htmlFiles = [
    'system_overview.html',
    'pest_detection_flow.html',
    'voice_recognition.html',
    'faq.html'
  ];
  
  for (const htmlFile of htmlFiles) {
    const htmlPath = path.join(__dirname, 'pic', 'manual', htmlFile);
    const pngPath = path.join(__dirname, 'pic', 'manual', htmlFile.replace('.html', '.png'));
    
    // 检查HTML文件是否存在
    if (!fs.existsSync(htmlPath)) {
      console.log(`文件不存在: ${htmlPath}`);
      continue;
    }
    
    // 读取HTML内容
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    
    // 设置页面内容
    await page.setContent(htmlContent);
    
    // 获取内容尺寸
    const dimensions = await page.evaluate(() => {
      const container = document.querySelector('.container');
      return {
        width: container.offsetWidth,
        height: container.offsetHeight
      };
    });
    
    // 设置视口大小
    await page.setViewport({
      width: dimensions.width,
      height: dimensions.height
    });
    
    // 截图
    await page.screenshot({
      path: pngPath,
      clip: {
        x: 0,
        y: 0,
        width: dimensions.width,
        height: dimensions.height
      }
    });
    
    console.log(`已生成图片: ${pngPath}`);
  }
  
  await browser.close();
  console.log('所有HTML已转换为PNG图片');
}

convertHtmlToPng().catch(console.error);