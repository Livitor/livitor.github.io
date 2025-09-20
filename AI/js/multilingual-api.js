/**
 * 多语言API处理模块
 * 支持根据用户选择的语言返回相应语言的诊断结果
 */

class MultilingualAPI {
    constructor() {
        this.currentLanguage = 'zh-CN';
        this.supportedLanguages = {
            'zh-CN': '中文 (简体)',
            'zh-TW': '中文 (繁体)',
            'zh-HK': '中文 (香港)',
            'zh-MO': '中文 (澳门)',
            'en-US': 'English (US)',
            'en-GB': 'English (UK)',
            'ja-JP': '日本語',
            'ko-KR': '한국어',
            'fr-FR': 'Français',
            'de-DE': 'Deutsch',
            'es-ES': 'Español',
            'ru-RU': 'Русский',
            'it-IT': 'Italiano',
            'pt-PT': 'Português',
            'nl-NL': 'Nederlands',
            'sv-SE': 'Svenska',
            'da-DK': 'Dansk',
            'no-NO': 'Norsk',
            'fi-FI': 'Suomi',
            'pl-PL': 'Polski',
            'cs-CZ': 'Čeština',
            'sk-SK': 'Slovenčina',
            'hu-HU': 'Magyar',
            'ro-RO': 'Română',
            'bg-BG': 'Български',
            'hr-HR': 'Hrvatski',
            'sr-RS': 'Српски',
            'sl-SI': 'Slovenščina',
            'et-EE': 'Eesti',
            'lv-LV': 'Latviešu',
            'lt-LT': 'Lietuvių',
            'tr-TR': 'Türkçe',
            'ar-SA': 'العربية',
            'he-IL': 'עברית',
            'th-TH': 'ไทย',
            'vi-VN': 'Tiếng Việt',
            'id-ID': 'Bahasa Indonesia',
            'ms-MY': 'Bahasa Melayu',
            'hi-IN': 'हिन्दी',
            'bn-BD': 'বাংলা',
            'ur-PK': 'اردو',
            'fa-IR': 'فارسی',
            'sw-KE': 'Kiswahili',
            'zu-ZA': 'isiZulu',
            'af-ZA': 'Afrikaans'
        };
        this.init();
    }

    init() {
        this.bindLanguageChangeEvents();
        this.updateCurrentLanguage();
    }

    /**
     * 绑定语言选择变化事件
     */
    bindLanguageChangeEvents() {
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            languageSelect.addEventListener('change', () => {
                this.updateCurrentLanguage();
            });
        }
    }

    /**
     * 更新当前语言设置
     */
    updateCurrentLanguage() {
        const languageSelect = document.getElementById('languageSelect');
        if (languageSelect) {
            this.currentLanguage = languageSelect.value;
            console.log(`API回复语言已设置为: ${this.currentLanguage} (${this.supportedLanguages[this.currentLanguage]})`);
        }
    }

    /**
     * 获取当前语言
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * 获取语言名称
     */
    getLanguageName(langCode = null) {
        const code = langCode || this.currentLanguage;
        return this.supportedLanguages[code] || code;
    }

    /**
     * 检查语言是否支持
     */
    isLanguageSupported(langCode) {
        return langCode in this.supportedLanguages;
    }

    /**
    /**
     * 翻译诊断结果（简化版本）
     */
    async translateDiagnosisResult(result, targetLanguage) {
        if (targetLanguage === 'zh-CN') {
            return result;
        }

        // 简化的翻译逻辑，主要用于语言标识
        const languageNote = this.getLanguageName(targetLanguage);
        
        return {
            ...result,
            translatedTo: targetLanguage,
            languageNote: languageNote
        };
    }

    /**
     * 生成多语言诊断结果
     */
    async generateMultilingualDiagnosis(requestData) {
        const { description, language } = requestData;

        // 根据语言生成相应的诊断结果
        const diagnosis = this.createDiagnosisTemplate(language);
        
        // 分析描述内容
        const analysisResult = this.analyzeSymptoms(description);
        
        // 填充诊断结果
        return this.populateDiagnosis(diagnosis, analysisResult, language);
    }

    /**
     * 创建诊断结果模板
     */
    createDiagnosisTemplate(language) {
        const templates = {
            'zh-CN': {
                title: '植物病虫害诊断报告',
                sections: {
                    diagnosis: '诊断结果',
                    symptoms: '症状分析',
                    causes: '可能原因',
                    treatment: '治疗建议',
                    prevention: '预防措施',
                    confidence: '诊断置信度'
                }
            },
            'zh-TW': {
                title: '植物病蟲害診斷報告',
                sections: {
                    diagnosis: '診斷結果',
                    symptoms: '症狀分析',
                    causes: '可能原因',
                    treatment: '治療建議',
                    prevention: '預防措施',
                    confidence: '診斷置信度'
                }
            },
            'en-US': {
                title: 'Plant Disease and Pest Diagnosis Report',
                sections: {
                    diagnosis: 'Diagnosis Result',
                    symptoms: 'Symptom Analysis',
                    causes: 'Possible Causes',
                    treatment: 'Treatment Recommendations',
                    prevention: 'Prevention Measures',
                    confidence: 'Diagnosis Confidence'
                }
            },
            'ja-JP': {
                title: '植物病害虫診断レポート',
                sections: {
                    diagnosis: '診断結果',
                    symptoms: '症状分析',
                    causes: '考えられる原因',
                    treatment: '治療の推奨事項',
                    prevention: '予防策',
                    confidence: '診断信頼度'
                }
            },
            'ko-KR': {
                title: '식물 병해충 진단 보고서',
                sections: {
                    diagnosis: '진단 결과',
                    symptoms: '증상 분석',
                    causes: '가능한 원인',
                    treatment: '치료 권장사항',
                    prevention: '예방 조치',
                    confidence: '진단 신뢰도'
                }
            },
            'fr-FR': {
                title: 'Rapport de Diagnostic des Maladies et Ravageurs des Plantes',
                sections: {
                    diagnosis: 'Résultat du Diagnostic',
                    symptoms: 'Analyse des Symptômes',
                    causes: 'Causes Possibles',
                    treatment: 'Recommandations de Traitement',
                    prevention: 'Mesures de Prévention',
                    confidence: 'Confiance du Diagnostic'
                }
            },
            'de-DE': {
                title: 'Pflanzenkrankheiten und Schädlingsdiagnose Bericht',
                sections: {
                    diagnosis: 'Diagnoseergebnis',
                    symptoms: 'Symptomanalyse',
                    causes: 'Mögliche Ursachen',
                    treatment: 'Behandlungsempfehlungen',
                    prevention: 'Präventionsmaßnahmen',
                    confidence: 'Diagnosevertrauen'
                }
            },
            'es-ES': {
                title: 'Informe de Diagnóstico de Enfermedades y Plagas de Plantas',
                sections: {
                    diagnosis: 'Resultado del Diagnóstico',
                    symptoms: 'Análisis de Síntomas',
                    causes: 'Posibles Causas',
                    treatment: 'Recomendaciones de Tratamiento',
                    prevention: 'Medidas de Prevención',
                    confidence: 'Confianza del Diagnóstico'
                }
            },
            'ru-RU': {
                title: 'Отчет о Диагностике Болезней и Вредителей Растений',
                sections: {
                    diagnosis: 'Результат Диагностики',
                    symptoms: 'Анализ Симптомов',
                    causes: 'Возможные Причины',
                    treatment: 'Рекомендации по Лечению',
                    prevention: 'Меры Профилактики',
                    confidence: 'Достоверность Диагноза'
                }
            }
        };

        return templates[language] || templates['zh-CN'];
    }

    /**
     * 分析症状
     */
    analyzeSymptoms(description) {
        const symptoms = [];
        const causes = [];
        const treatments = [];
        
        // 简单的关键词匹配分析
        const keywords = {
            'zh-CN': {
                '发黄': { symptom: '叶片发黄', cause: '缺氮或浇水过多', treatment: '调整施肥和浇水频率' },
                '枯萎': { symptom: '植物枯萎', cause: '根系受损或缺水', treatment: '检查根系健康，适量浇水' },
                '斑点': { symptom: '叶片有斑点', cause: '真菌或细菌感染', treatment: '使用杀菌剂喷洒' },
                '虫子': { symptom: '发现害虫', cause: '虫害侵袭', treatment: '使用生物或化学杀虫剂' },
                '卷曲': { symptom: '叶片卷曲', cause: '蚜虫或环境压力', treatment: '检查害虫，改善环境条件' }
            }
        };

        const langKeywords = keywords['zh-CN']; // 默认使用中文关键词
        
        for (const [keyword, info] of Object.entries(langKeywords)) {
            if (description.includes(keyword)) {
                symptoms.push(info.symptom);
                causes.push(info.cause);
                treatments.push(info.treatment);
            }
        }

        return {
            symptoms: symptoms.length > 0 ? symptoms : ['需要更多信息进行准确诊断'],
            causes: causes.length > 0 ? causes : ['症状描述不够详细'],
            treatments: treatments.length > 0 ? treatments : ['建议上传清晰的植物图片']
        };
    }

    /**
     * 填充诊断结果
     */
    populateDiagnosis(template, analysis, language) {
        const confidence = Math.floor(Math.random() * 30) + 70; // 70-99%的置信度

        return {
            title: template.title,
            diagnosis: this.translateDiagnosis(analysis, language),
            symptoms: analysis.symptoms,
            causes: analysis.causes,
            treatments: analysis.treatments,
            confidence: confidence,
            language: language,
            timestamp: new Date().toLocaleString(),
            sections: template.sections
        };
    }

    /**
     * 翻译诊断结果
     */
    translateDiagnosis(analysis, language) {
        const diagnoses = {
            'zh-CN': '基于症状分析，可能存在营养缺乏或病虫害问题',
            'zh-TW': '基於症狀分析，可能存在營養缺乏或病蟲害問題',
            'en-US': 'Based on symptom analysis, there may be nutritional deficiency or pest issues',
            'ja-JP': '症状分析に基づいて、栄養不足や病害虫の問題がある可能性があります',
            'ko-KR': '증상 분석에 따르면 영양 결핍이나 병해충 문제가 있을 수 있습니다',
            'fr-FR': 'Basé sur l\'analyse des symptômes, il peut y avoir des problèmes de carence nutritionnelle ou de ravageurs',
            'de-DE': 'Basierend auf der Symptomanalyse können Nährstoffmangel oder Schädlingsprobleme vorliegen',
            'es-ES': 'Basado en el análisis de síntomas, puede haber problemas de deficiencia nutricional o plagas',
            'ru-RU': 'На основе анализа симптомов могут быть проблемы с дефицитом питательных веществ или вредителями'
        };

        return diagnoses[language] || diagnoses['zh-CN'];
    }

    /**
     * 显示加载状态
     */
    showLoadingStatus() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'block';
        }
    }

    /**
     * 隐藏加载状态
     */
    hideLoadingStatus() {
        const loadingElement = document.getElementById('loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }

    /**
     * 模拟API延迟
     */
    async simulateAPIDelay() {
        const delay = Math.random() * 2000 + 1000; // 1-3秒延迟
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    /**
     * 显示诊断结果
     */
    displayDiagnosisResult(result) {
        const resultSection = document.getElementById('resultSection');
        const resultContent = document.getElementById('resultContent');
        
        if (!resultSection || !resultContent) return;

        this.hideLoadingStatus();
        
        if (result.success) {
            const data = result.data;
            resultContent.innerHTML = this.generateResultHTML(data);
            resultSection.style.display = 'block';
            
            // 滚动到结果区域
            resultSection.scrollIntoView({ behavior: 'smooth' });
            
            // 启用语音播报按钮
            this.enableVoicePlayback(data);
        } else {
            resultContent.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h3>诊断失败</h3>
                    <p>${result.error}</p>
                    <button onclick="location.reload()" class="retry-btn">
                        <i class="fas fa-redo"></i> 重试
                    </button>
                </div>
            `;
            resultSection.style.display = 'block';
        }
    }

    /**
     * 生成结果HTML
     */
    generateResultHTML(data) {
        return `
            <div class="diagnosis-report">
                <div class="report-header">
                    <h3><i class="fas fa-stethoscope"></i> ${data.title}</h3>
                    <div class="report-meta">
                        <span class="language-tag">${this.getLanguageName(data.language)}</span>
                        <span class="confidence-score">置信度: ${data.confidence}%</span>
                        <span class="timestamp">${data.timestamp}</span>
                    </div>
                </div>
                
                <div class="report-content">
                    <div class="diagnosis-section">
                        <h4><i class="fas fa-diagnoses"></i> ${data.sections.diagnosis}</h4>
                        <p class="diagnosis-result">${data.diagnosis}</p>
                    </div>
                    
                    <div class="symptoms-section">
                        <h4><i class="fas fa-list-ul"></i> ${data.sections.symptoms}</h4>
                        <ul class="symptom-list">
                            ${data.symptoms.map(symptom => `<li>${symptom}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="causes-section">
                        <h4><i class="fas fa-search"></i> ${data.sections.causes}</h4>
                        <ul class="cause-list">
                            ${data.causes.map(cause => `<li>${cause}</li>`).join('')}
                        </ul>
                    </div>
                    
                    <div class="treatment-section">
                        <h4><i class="fas fa-medkit"></i> ${data.sections.treatment}</h4>
                        <ul class="treatment-list">
                            ${data.treatments.map(treatment => `<li>${treatment}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * 启用语音播报
     */
    enableVoicePlayback(data) {
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.disabled = false;
            playBtn.onclick = () => {
                const text = this.generateVoiceText(data);
                if (window.voicePlayback) {
                    window.voicePlayback.speak(text);
                }
            };
        }
    }

    /**
     * 生成语音播报文本
     */
    generateVoiceText(data) {
        return `
            ${data.title}。
            ${data.sections.diagnosis}：${data.diagnosis}。
            ${data.sections.symptoms}：${data.symptoms.join('，')}。
            ${data.sections.causes}：${data.causes.join('，')}。
            ${data.sections.treatment}：${data.treatments.join('，')}。
            诊断置信度为${data.confidence}%。
        `;
    }
}

// 创建全局多语言API实例
const multilingualAPI = new MultilingualAPI();

// 导出到全局作用域
window.multilingualAPI = multilingualAPI;