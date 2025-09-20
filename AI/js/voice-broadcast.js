/**
 * 语音播报管理器
 * 负责诊断结果的语音播报，支持多语言和播报控制
 * 修复版本：解决播报不完整和语言混杂问题
 */
class VoiceBroadcastManager {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.currentUtterance = null;
        this.isPlaying = false;
        this.isPaused = false;
        this.currentText = '';
        this.currentLang = 'zh-CN';
        this.queue = [];
        this.currentIndex = 0;
        this.selectedVoiceCache = null; // 缓存选择的语音，确保一致性
        
        this.init();
    }

    init() {
        // 监听页面刷新/关闭事件，停止播报
        window.addEventListener('beforeunload', () => {
            this.stopBroadcast();
        });

        // 监听语音合成事件
        this.synthesis.addEventListener('voiceschanged', () => {
            this.updateVoiceOptions();
        });

        // 立即尝试获取语音列表
        this.updateVoiceOptions();
        
        // 如果语音列表为空，等待一段时间后重试
        if (this.synthesis.getVoices().length === 0) {
            setTimeout(() => {
                this.updateVoiceOptions();
                console.log('延迟加载语音列表:', this.synthesis.getVoices().length);
            }, 1000);
        }

        this.bindEvents();
    }

    bindEvents() {
        // 暂停播报按钮
        document.addEventListener('click', (e) => {
            if (e.target.id === 'pauseVoiceBtn' || e.target.closest('#pauseVoiceBtn')) {
                this.pauseBroadcast();
            }
        });

        // 继续播报按钮
        document.addEventListener('click', (e) => {
            if (e.target.id === 'resumeVoiceBtn' || e.target.closest('#resumeVoiceBtn')) {
                this.resumeBroadcast();
            }
        });

        // 停止播报按钮
        document.addEventListener('click', (e) => {
            if (e.target.id === 'stopVoiceBtn' || e.target.closest('#stopVoiceBtn')) {
                this.stopBroadcast();
            }
        });

        // 关闭面板按钮
        document.addEventListener('click', (e) => {
            if (e.target.id === 'closeVoiceBtn' || e.target.closest('#closeVoiceBtn')) {
                this.stopBroadcast();
                this.hideVoiceControlPanel();
            }
        });
    }

    // 获取可用的语音选项
    updateVoiceOptions() {
        const voices = this.synthesis.getVoices();
        this.availableVoices = voices;
        console.log('更新语音列表，共', voices.length, '个语音');
    }

    // 选择最佳语音（缓存结果确保一致性）
    // 选择最佳语音（缓存结果确保一致性，优先选择女声）
    selectBestVoice(lang) {
        // 如果已经为这个语言选择过语音，直接返回缓存的结果
        if (this.selectedVoiceCache && this.selectedVoiceCache.lang === lang) {
            console.log('使用缓存的语音:', this.selectedVoiceCache.voice.name);
            return this.selectedVoiceCache.voice;
        }
        
        const voices = this.synthesis.getVoices();
        console.log('=== 语音选择过程 ===');
        console.log('目标语言:', lang);
        console.log('可用语音数量:', voices.length);
        
        // 语言映射表，处理常见的语言代码变体
        const langMappings = {
            'zh-CN': ['zh-CN', 'zh', 'cmn-Hans-CN', 'zh-Hans-CN'],
            'zh-TW': ['zh-TW', 'zh-Hant-TW', 'cmn-Hant-TW'],
            'zh-HK': ['zh-HK', 'zh-Hant-HK', 'yue-Hant-HK'],
            'en-US': ['en-US', 'en'],
            'en-GB': ['en-GB', 'en-UK'],
            'ja-JP': ['ja-JP', 'ja'],
            'ko-KR': ['ko-KR', 'ko'],
            'fr-FR': ['fr-FR', 'fr'],
            'de-DE': ['de-DE', 'de'],
            'es-ES': ['es-ES', 'es'],
            'ru-RU': ['ru-RU', 'ru'],
            'it-IT': ['it-IT', 'it'],
            'pt-PT': ['pt-PT', 'pt'],
            'nl-NL': ['nl-NL', 'nl'],
            'ar-SA': ['ar-SA', 'ar'],
            'th-TH': ['th-TH', 'th'],
            'vi-VN': ['vi-VN', 'vi'],
            'hi-IN': ['hi-IN', 'hi']
        };
        
        // 优质女声语音名称列表（按优先级排序）
        const preferredFemaleVoices = {
            'zh-CN': [
                'Microsoft Xiaoxiao - Chinese (Simplified, PRC)',
                'Microsoft Yaoyao - Chinese (Simplified, PRC)', 
                'Microsoft Hanhan - Chinese (Simplified, PRC)',
                'Microsoft Kangkang - Chinese (Simplified, PRC)',
                'Google 中文（中国大陆）',
                'Ting-Ting',
                'Sin-ji',
                'Mei-Jia'
            ],
            'zh-TW': [
                'Microsoft Yating - Chinese (Traditional, Taiwan)',
                'Microsoft Hanhan - Chinese (Traditional, Taiwan)',
                'Mei-Jia'
            ],
            'en-US': [
                'Microsoft Zira - English (United States)',
                'Microsoft Eva - English (United States)',
                'Google US English',
                'Samantha',
                'Alex'
            ],
            'ja-JP': [
                'Microsoft Haruka - Japanese',
                'Microsoft Ayumi - Japanese',
                'Google 日本語',
                'Kyoko'
            ]
        };
        
        // 获取目标语言的所有可能变体
        const targetLangs = langMappings[lang] || [lang, lang.split('-')[0]];
        let voice = null;
        
        // 1. 优先选择推荐的女声语音
        const preferredVoices = preferredFemaleVoices[lang] || [];
        for (const preferredName of preferredVoices) {
            voice = voices.find(v => 
                v.name.includes(preferredName) || 
                preferredName.includes(v.name) ||
                v.name === preferredName
            );
            if (voice) {
                console.log('✓ 找到推荐女声语音:', voice.name, '(' + voice.lang + ')');
                break;
            }
        }
        
        // 2. 如果没找到推荐语音，按语言代码精确匹配，优先选择女声
        if (!voice) {
            for (const targetLang of targetLangs) {
                const matchingVoices = voices.filter(v => v.lang === targetLang);
                if (matchingVoices.length > 0) {
                    // 优先选择名称中包含女性特征的语音
                    voice = matchingVoices.find(v => 
                        /xiaoxiao|yaoyao|hanhan|zira|eva|haruka|ayumi|ting|mei|yating|female/i.test(v.name)
                    ) || matchingVoices[0];
                    console.log('✓ 找到精确匹配语音:', voice.name, '(' + voice.lang + ')');
                    break;
                }
            }
        }
        
        // 3. 前缀匹配，优先选择女声
        if (!voice) {
            const langPrefix = lang.split('-')[0];
            const matchingVoices = voices.filter(v => v.lang.startsWith(langPrefix));
            if (matchingVoices.length > 0) {
                voice = matchingVoices.find(v => 
                    /xiaoxiao|yaoyao|hanhan|zira|eva|haruka|ayumi|ting|mei|yating|female/i.test(v.name)
                ) || matchingVoices[0];
                console.log('✓ 找到前缀匹配语音:', voice.name, '(' + voice.lang + ')');
            }
        }
        
        // 4. 使用默认语音或第一个可用语音
        if (!voice) {
            voice = voices.find(v => v.default) || voices[0];
            console.log('⚠ 使用默认语音:', voice ? voice.name + ' (' + voice.lang + ')' : '无可用语音');
        }
        
        // 缓存选择的语音，确保整个播报过程使用相同语音
        if (voice) {
            this.selectedVoiceCache = {
                lang: lang,
                voice: voice
            };
        }
        
        console.log('=== 最终选择语音 ===');
        console.log('语音名称:', voice ? voice.name : '无');
        console.log('语音语言:', voice ? voice.lang : '无');
        console.log('语音性别:', voice && /xiaoxiao|yaoyao|hanhan|zira|eva|haruka|ayumi|ting|mei|yating|female/i.test(voice.name) ? '女声' : '未知');
        console.log('==================');
        
        return voice;
    }

    // 翻译固定模板标题
    async translateTemplate(text, targetLang) {
        if (targetLang === 'zh-CN' || targetLang === 'zh') {
            return text; // 中文不需要翻译
        }

        // 模板标题映射
        const templateMap = {
            '症状分析': 'Symptom Analysis',
            '病情分析': 'Disease Analysis', 
            '治疗建议': 'Treatment Recommendations',
            '预防措施': 'Prevention Measures',
            '注意事项': 'Precautions',
            '诊断结果': 'Diagnosis Results',
            '病虫害识别': 'Pest and Disease Identification',
            '严重程度': 'Severity Level',
            '影响范围': 'Affected Area',
            '发病原因': 'Cause of Disease',
            '用药建议': 'Medication Recommendations'
        };

        // 如果是英文目标语言，直接使用映射
        if (targetLang.startsWith('en')) {
            return templateMap[text] || text;
        }

        // 其他语言使用翻译API
        try {
            if (window.multilingualAPI && window.multilingualAPI.translateText) {
                const translatedText = await window.multilingualAPI.translateText(text, 'zh-CN', targetLang);
                return translatedText || text;
            } else {
                console.warn('多语言API不可用，使用英文映射');
                return templateMap[text] || text;
            }
        } catch (error) {
            console.warn('模板翻译失败:', error);
            return templateMap[text] || text; // 降级到英文
        }
    }

    // 处理诊断结果并准备播报内容
    async prepareBroadcastContent(result, targetLang = 'zh-CN') {
        try {
            console.log('=== 准备播报内容 ===');
            console.log('目标语言:', targetLang);
            console.log('原始结果:', result);
            
            let broadcastText = '';
            
            // 添加开场白
            const intro = await this.translateTemplate('诊断结果', targetLang);
            broadcastText += intro + '。\n\n';

            // 处理结果的各个部分
            if (result.symptoms) {
                console.log('处理症状分析...');
                const symptomsTitle = await this.translateTemplate('症状分析', targetLang);
                let symptomsContent = result.symptoms;
                
                if (targetLang !== 'zh-CN' && targetLang !== 'zh') {
                    if (window.multilingualAPI && window.multilingualAPI.translateText) {
                        try {
                            symptomsContent = await window.multilingualAPI.translateText(symptomsContent, 'zh-CN', targetLang);
                            console.log('症状内容翻译完成');
                        } catch (error) {
                            console.warn('症状内容翻译失败:', error);
                        }
                    }
                }
                
                broadcastText += `${symptomsTitle}：${symptomsContent}\n\n`;
            }

            if (result.diagnosis) {
                console.log('处理病情分析...');
                const diagnosisTitle = await this.translateTemplate('病情分析', targetLang);
                let diagnosisContent = result.diagnosis;
                
                if (targetLang !== 'zh-CN' && targetLang !== 'zh') {
                    if (window.multilingualAPI && window.multilingualAPI.translateText) {
                        try {
                            diagnosisContent = await window.multilingualAPI.translateText(diagnosisContent, 'zh-CN', targetLang);
                            console.log('诊断内容翻译完成');
                        } catch (error) {
                            console.warn('诊断内容翻译失败:', error);
                        }
                    }
                }
                
                broadcastText += `${diagnosisTitle}：${diagnosisContent}\n\n`;
            }

            if (result.treatment) {
                console.log('处理治疗建议...');
                const treatmentTitle = await this.translateTemplate('治疗建议', targetLang);
                let treatmentContent = result.treatment;
                
                if (targetLang !== 'zh-CN' && targetLang !== 'zh') {
                    if (window.multilingualAPI && window.multilingualAPI.translateText) {
                        try {
                            treatmentContent = await window.multilingualAPI.translateText(treatmentContent, 'zh-CN', targetLang);
                            console.log('治疗内容翻译完成');
                        } catch (error) {
                            console.warn('治疗内容翻译失败:', error);
                        }
                    }
                }
                
                broadcastText += `${treatmentTitle}：${treatmentContent}\n\n`;
            }

            if (result.prevention) {
                console.log('处理预防措施...');
                const preventionTitle = await this.translateTemplate('预防措施', targetLang);
                let preventionContent = result.prevention;
                
                if (targetLang !== 'zh-CN' && targetLang !== 'zh') {
                    if (window.multilingualAPI && window.multilingualAPI.translateText) {
                        try {
                            preventionContent = await window.multilingualAPI.translateText(preventionContent, 'zh-CN', targetLang);
                            console.log('预防内容翻译完成');
                        } catch (error) {
                            console.warn('预防内容翻译失败:', error);
                        }
                    }
                }
                
                broadcastText += `${preventionTitle}：${preventionContent}`;
            }

            const finalText = broadcastText.trim();
            console.log('最终播报内容长度:', finalText.length);
            console.log('最终播报内容预览:', finalText.substring(0, 200) + '...');
            
            return finalText;
        } catch (error) {
            console.error('准备播报内容失败:', error);
            return '诊断结果准备失败，请查看屏幕显示的结果。';
        }
    }

    // 分割文本为播报段落（改进版，确保不丢失内容）
    splitTextForBroadcast(text) {
        console.log('=== 分割播报文本 ===');
        console.log('原始文本长度:', text.length);
        console.log('原始文本:', text);
        
        // 按双换行符分割段落
        const paragraphs = text.split('\n\n').filter(p => p.trim());
        const segments = [];
        
        console.log('初始段落数量:', paragraphs.length);
        
        paragraphs.forEach((paragraph, index) => {
            const trimmedParagraph = paragraph.trim();
            console.log(`处理段落 ${index + 1}:`, trimmedParagraph.substring(0, 100) + '...');
            
            if (trimmedParagraph.length <= 300) {
                // 短段落直接添加
                segments.push(trimmedParagraph);
                console.log(`段落 ${index + 1} 直接添加，长度:`, trimmedParagraph.length);
            } else {
                // 长段落按句子分割，保持语义完整
                console.log(`段落 ${index + 1} 需要分割，长度:`, trimmedParagraph.length);
                
                // 使用更精确的句子分割
                const sentences = trimmedParagraph.split(/([。！？.!?]+\s*)/);
                let currentSegment = '';
                
                for (let i = 0; i < sentences.length; i += 2) {
                    const sentence = sentences[i];
                    const punctuation = sentences[i + 1] || '';
                    
                    if (sentence && sentence.trim()) {
                        const fullSentence = sentence.trim() + punctuation;
                        const testSegment = currentSegment + (currentSegment ? ' ' : '') + fullSentence;
                        
                        if (testSegment.length <= 300) {
                            currentSegment = testSegment;
                        } else {
                            // 当前段落已满，保存并开始新段落
                            if (currentSegment.trim()) {
                                segments.push(currentSegment.trim());
                                console.log('添加分割段落，长度:', currentSegment.trim().length);
                            }
                            currentSegment = fullSentence;
                        }
                    }
                }
                
                // 添加最后一个段落
                if (currentSegment.trim()) {
                    segments.push(currentSegment.trim());
                    console.log('添加最后分割段落，长度:', currentSegment.trim().length);
                }
            }
        });
        
        const finalSegments = segments.filter(seg => seg.trim());
        console.log('=== 分割结果 ===');
        console.log('最终段落数量:', finalSegments.length);
        
        finalSegments.forEach((seg, i) => {
            console.log(`最终段落 ${i + 1} (${seg.length}字):`, seg.substring(0, 50) + (seg.length > 50 ? '...' : ''));
        });
        
        // 验证内容完整性
        const totalLength = finalSegments.join('').length;
        const originalLength = text.replace(/\s+/g, '').length;
        console.log('原始内容长度:', originalLength, '分割后长度:', totalLength);
        
        if (Math.abs(totalLength - originalLength) > 10) {
            console.warn('⚠ 内容可能有丢失！');
        }
        
        return finalSegments;
    }

    // 开始播报诊断结果
    async startBroadcast(result, targetLang = 'zh-CN') {
        try {
            console.log('=== 开始语音播报 ===');
            console.log('目标语言:', targetLang);
            
            // 停止当前播报
            this.stopBroadcast();
            
            // 清除之前的语音缓存，确保重新选择语音
            this.selectedVoiceCache = null;
            
            // 显示语音控制面板
            this.showVoiceControlPanel();
            
            // 准备播报内容
            this.updateStatus('正在准备播报内容...');
            const broadcastText = await this.prepareBroadcastContent(result, targetLang);
            
            if (!broadcastText || broadcastText.trim() === '') {
                throw new Error('播报内容为空');
            }
            
            console.log('准备播报的完整内容长度:', broadcastText.length);
            
            // 分段播报（避免内容过长）
            this.queue = this.splitTextForBroadcast(broadcastText);
            this.currentIndex = 0;
            this.currentLang = targetLang;
            
            if (this.queue.length === 0) {
                throw new Error('分段后内容为空');
            }
            
            console.log('总共分为', this.queue.length, '个段落');
            
            // 预先选择语音，确保整个播报过程使用相同语音
            const selectedVoice = this.selectBestVoice(targetLang);
            if (!selectedVoice) {
                console.warn('未找到合适的语音，将使用系统默认语音');
            }
            
            // 开始播报
            this.playNextSegment();
            
        } catch (error) {
            console.error('开始播报失败:', error);
            this.updateStatus('播报失败: ' + error.message);
            setTimeout(() => {
                this.hideVoiceControlPanel();
            }, 3000);
        }
    }

    // 播放下一个段落（改进版，确保完整播报）
    playNextSegment() {
        if (this.currentIndex >= this.queue.length) {
            // 播报完成
            console.log('✅ 所有段落播报完成');
            this.onBroadcastComplete();
            return;
        }

        const text = this.queue[this.currentIndex];
        this.currentText = text;
        
        console.log(`=== 播报段落 ${this.currentIndex + 1}/${this.queue.length} ===`);
        console.log('段落内容:', text);
        console.log('段落长度:', text.length);
        
        // 创建语音合成实例
        this.currentUtterance = new SpeechSynthesisUtterance(text);
        
        // 设置语音参数
        // 设置语音参数，针对女声优化
        this.currentUtterance.lang = this.currentLang;
        
        // 获取并缓存语音，确保一致性
        const voice = this.selectBestVoice(this.currentLang);
        const isFemaleVoice = voice && /xiaoxiao|yaoyao|hanhan|zira|eva|haruka|ayumi|ting|mei|yating|female/i.test(voice.name);
        
        if (this.currentLang.startsWith('zh')) {
            // 中文女声优化参数
            this.currentUtterance.rate = isFemaleVoice ? 0.8 : 0.85; // 女声稍慢，更温柔
            this.currentUtterance.pitch = isFemaleVoice ? 1.1 : 1.0; // 女声音调稍高，更悦耳
            this.currentUtterance.volume = 0.9;
        } else {
            // 其他语言的优化参数
            this.currentUtterance.rate = 0.85;
            this.currentUtterance.pitch = isFemaleVoice ? 1.05 : 1.0;
            this.currentUtterance.volume = 0.9;
        }
        
        // 设置语音
        if (voice) {
            this.currentUtterance.voice = voice;
            console.log('✓ 使用语音:', voice.name, '(' + voice.lang + ')');
        } else {
            console.warn('⚠ 未找到合适的语音');
        }
        
        console.log('语音参数设置:', {
            rate: this.currentUtterance.rate,
            pitch: this.currentUtterance.pitch,
            volume: this.currentUtterance.volume,
            isFemale: isFemaleVoice,
            voiceName: voice ? voice.name : '无'
        });
        
        // 设置事件监听
        this.currentUtterance.onstart = () => {
            console.log('▶ 开始播报段落:', this.currentIndex + 1);
            this.isPlaying = true;
            this.isPaused = false;
            this.updateStatus(`正在播报第 ${this.currentIndex + 1}/${this.queue.length} 段...`);
            this.updateProgress(this.currentIndex + 1, this.queue.length);
            this.updateControlButtons();
        };
        
        this.currentUtterance.onend = () => {
            console.log('✓ 段落播报完成:', this.currentIndex + 1);
            this.currentIndex++;
            
            // 检查是否还有更多段落
            if (this.currentIndex < this.queue.length) {
                console.log('➡ 准备播报下一段落...');
                setTimeout(() => {
                    this.playNextSegment();
                }, 800); // 段落间停顿0.8秒，让用户有时间理解
            } else {
                console.log('🎉 所有段落播报完成');
                this.onBroadcastComplete();
            }
        };
        
        this.currentUtterance.onerror = (event) => {
            console.error('❌ 语音播报错误:', event);
            console.error('错误段落:', text);
            
            // 尝试播报下一段落
            this.currentIndex++;
            if (this.currentIndex < this.queue.length) {
                console.log('⏭ 跳过错误段落，继续播报下一段...');
                setTimeout(() => {
                    this.playNextSegment();
                }, 500);
            } else {
                console.log('⚠ 播报过程中出现错误，结束播报');
                this.onBroadcastComplete();
            }
        };
        
        this.currentUtterance.onpause = () => {
            console.log('⏸ 播报已暂停');
        };
        
        this.currentUtterance.onresume = () => {
            console.log('▶ 播报已恢复');
        };
        
        // 开始播报
        console.log('🔊 调用 speechSynthesis.speak()');
        this.synthesis.speak(this.currentUtterance);
        
        // 检查播报是否真的开始了
        setTimeout(() => {
            if (!this.synthesis.speaking && !this.synthesis.pending) {
                console.warn('⚠ 播报可能没有开始，尝试重新播报');
                this.synthesis.speak(this.currentUtterance);
            }
        }, 200);
    }

    // 暂停播报
    pauseBroadcast() {
        if (this.isPlaying && !this.isPaused) {
            this.synthesis.pause();
            this.isPaused = true;
            this.updateStatus('播报已暂停');
            this.updateControlButtons();
            console.log('⏸ 播报已暂停');
        }
    }

    // 继续播报
    resumeBroadcast() {
        if (this.isPaused) {
            this.synthesis.resume();
            this.isPaused = false;
            this.updateStatus(`继续播报第 ${this.currentIndex + 1}/${this.queue.length} 段...`);
            this.updateControlButtons();
            console.log('▶ 播报已恢复');
        }
    }

    // 停止播报
    stopBroadcast() {
        console.log('⏹ 停止语音播报');
        
        // 取消所有语音合成
        if (this.synthesis.speaking || this.synthesis.pending) {
            this.synthesis.cancel();
        }
        
        // 清理状态
        this.isPlaying = false;
        this.isPaused = false;
        this.currentUtterance = null;
        this.queue = [];
        this.currentIndex = 0;
        this.selectedVoiceCache = null; // 清除语音缓存
        
        this.updateStatus('播报已停止');
        this.hideVoiceControlPanel();
    }

    // 播报完成
    onBroadcastComplete() {
        console.log('🎉 播报完成');
        this.isPlaying = false;
        this.isPaused = false;
        this.currentUtterance = null;
        this.selectedVoiceCache = null; // 清除语音缓存
        
        this.updateStatus('播报完成');
        setTimeout(() => {
            this.hideVoiceControlPanel();
        }, 3000);
    }

    // 显示语音播报面板
    showVoiceControlPanel() {
        const panel = document.getElementById('voiceBroadcastPanel');
        if (panel) {
            panel.style.display = 'block';
            panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            console.log('显示语音控制面板');
        }
    }

    // 隐藏语音播报面板
    hideVoiceControlPanel() {
        const panel = document.getElementById('voiceBroadcastPanel');
        if (panel) {
            panel.style.display = 'none';
            console.log('隐藏语音控制面板');
        }
    }

    // 更新状态显示
    updateStatus(status) {
        const statusElement = document.getElementById('broadcastStatusText');
        if (statusElement) {
            statusElement.textContent = status;
        }
        console.log('状态更新:', status);
    }

    // 更新播报进度
    updateProgress(current, total) {
        const progressFill = document.getElementById('broadcastProgress');
        const progressText = document.getElementById('progressText');
        
        if (progressFill && total > 0) {
            const percentage = (current / total) * 100;
            progressFill.style.width = `${percentage}%`;
        }
        
        if (progressText) {
            progressText.textContent = `${current}/${total}`;
        }
        
        console.log('进度更新:', `${current}/${total}`);
    }

    // 更新控制按钮状态
    updateControlButtons() {
        const pauseBtn = document.getElementById('pauseVoiceBtn');
        const resumeBtn = document.getElementById('resumeVoiceBtn');
        
        if (pauseBtn && resumeBtn) {
            if (this.isPaused) {
                pauseBtn.style.display = 'none';
                resumeBtn.style.display = 'inline-block';
            } else {
                pauseBtn.style.display = 'inline-block';
                resumeBtn.style.display = 'none';
            }
        }
    }

    // 检查浏览器支持
    isSupported() {
        return 'speechSynthesis' in window;
    }
}

// 创建全局实例
window.voiceBroadcastManager = new VoiceBroadcastManager();

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VoiceBroadcastManager;
}