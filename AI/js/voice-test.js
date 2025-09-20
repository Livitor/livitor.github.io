/**
 * 语音播报测试工具
 * 用于测试多语言语音播报功能
 */
class VoiceTestManager {
    constructor() {
        this.synthesis = window.speechSynthesis;
    }

    // 测试语音播报
    testVoice(text, lang = 'zh-CN') {
        console.log('=== 语音播报测试 ===');
        console.log('测试文本:', text);
        console.log('目标语言:', lang);
        
        // 获取可用语音
        const voices = this.synthesis.getVoices();
        console.log('可用语音数量:', voices.length);
        console.log('可用语音列表:', voices.map(v => `${v.name} (${v.lang})`));
        
        // 查找匹配的语音
        let voice = voices.find(v => v.lang === lang);
        if (!voice) {
            const langPrefix = lang.split('-')[0];
            voice = voices.find(v => v.lang.startsWith(langPrefix));
        }
        if (!voice) {
            voice = voices.find(v => v.default) || voices[0];
        }
        
        console.log('选择的语音:', voice ? `${voice.name} (${voice.lang})` : '无可用语音');
        
        if (!voice) {
            console.error('没有找到合适的语音');
            return;
        }
        
        // 创建语音合成实例
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.voice = voice;
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        
        // 设置事件监听
        utterance.onstart = () => {
            console.log('语音播报开始');
        };
        
        utterance.onend = () => {
            console.log('语音播报结束');
        };
        
        utterance.onerror = (event) => {
            console.error('语音播报错误:', event);
        };
        
        // 开始播报
        console.log('开始播报...');
        this.synthesis.speak(utterance);
    }

    // 测试多种语言
    testMultipleLanguages() {
        const tests = [
            { text: '这是中文测试', lang: 'zh-CN' },
            { text: 'This is English test', lang: 'en-US' },
            { text: 'これは日本語のテストです', lang: 'ja-JP' },
            { text: '이것은 한국어 테스트입니다', lang: 'ko-KR' },
            { text: 'Ceci est un test français', lang: 'fr-FR' },
            { text: 'Dies ist ein deutscher Test', lang: 'de-DE' }
        ];
        
        tests.forEach((test, index) => {
            setTimeout(() => {
                console.log(`\n--- 测试 ${index + 1}: ${test.lang} ---`);
                this.testVoice(test.text, test.lang);
            }, index * 3000); // 每3秒测试一个
        });
    }

    // 列出所有可用语音
    listAllVoices() {
        const voices = this.synthesis.getVoices();
        console.log('=== 所有可用语音 ===');
        voices.forEach((voice, index) => {
            console.log(`${index + 1}. ${voice.name} (${voice.lang}) - ${voice.default ? '默认' : '非默认'}`);
        });
        return voices;
    }

    // 按语言分组显示语音
    groupVoicesByLanguage() {
        const voices = this.synthesis.getVoices();
        const grouped = {};
        
        voices.forEach(voice => {
            const lang = voice.lang;
            if (!grouped[lang]) {
                grouped[lang] = [];
            }
            grouped[lang].push(voice);
        });
        
        console.log('=== 按语言分组的语音 ===');
        Object.keys(grouped).sort().forEach(lang => {
            console.log(`${lang}:`);
            grouped[lang].forEach(voice => {
                console.log(`  - ${voice.name} ${voice.default ? '(默认)' : ''}`);
            });
        });
        
        return grouped;
    }
}

// 创建全局测试实例
window.voiceTestManager = new VoiceTestManager();

// 添加控制台快捷方法
window.testVoice = (text, lang) => window.voiceTestManager.testVoice(text, lang);
window.listVoices = () => window.voiceTestManager.listAllVoices();
window.groupVoices = () => window.voiceTestManager.groupVoicesByLanguage();
window.testMultiLang = () => window.voiceTestManager.testMultipleLanguages();

console.log('语音测试工具已加载！');
console.log('使用方法:');
console.log('- testVoice("测试文本", "zh-CN") - 测试指定语言的语音播报');
console.log('- listVoices() - 列出所有可用语音');
console.log('- groupVoices() - 按语言分组显示语音');
console.log('- testMultiLang() - 测试多种语言播报');