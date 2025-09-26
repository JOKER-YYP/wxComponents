// pages/aiChat/aiChat.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isChatActive: false,
    messages: [],
    inputValue: '',
    scrollTop: 0,
    scrollToView: '',
    messageIdCounter: 0
  },

  // 激活聊天界面
  activateChat() {
    this.setData({ isChatActive: true });
  },
  
  // 提问示例卡片点击
  askQuestion(e) {
    const question = e.currentTarget.dataset.question;
    this.setData({ 
      isChatActive: true,
      inputValue: question 
    }, () => {
      this.sendMessage();
    });
  },

  // 发送消息
  sendMessage() {
    const message = this.data.inputValue.trim();
    console.log(message);
    if (!message) return;

    // 添加用户消息
    const newMessageId = this.data.messageIdCounter + 1;
    const newMessages = [...this.data.messages, {
      id: newMessageId,
      role: 'user',
      content: message
    }];

    this.setData({ 
      messages: newMessages,
      inputValue: '',
      messageIdCounter: newMessageId,
      scrollToView: `msg${newMessages.length - 1}`
    });

    // 显示AI思考中
    this.showThinking(message, newMessageId + 1);
  },

  // 显示思考状态
  showThinking(question, messageId) {
    const aiMessage = {
      id: messageId,
      role: 'ai',
      type: 'thinking',
      step1: {
        title: '正在理解问题并定位研究方向',
        checked: false,
        keywords: []
      },
      step2: {
        title: '正在深入分析问题',
        checked: false,
        questions: []
      },
      showTyping: true,
      showConclusion: false,
      conclusionContent: ''
    };

    this.setData({
      messages: [...this.data.messages, aiMessage],
      messageIdCounter: messageId,
      scrollToView: `msg${this.data.messages.length}`
    });

    // 模拟加载进度
    this.simulateLoading(messageId);
    
    // 开始逐步显示思考过程
    setTimeout(() => {
      this.displayThinkingProcess(question, messageId);
    }, 500);
  },

  // 模拟加载进度
  simulateLoading(messageId) {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      if (progress > 100) {
        clearInterval(interval);
        return;
      }
      
      this.setData({
        [`messages[${this.findMessageIndex(messageId)}].progress`]: progress
      });
    }, 30);
  },

  // 显示思考过程
  displayThinkingProcess(question, messageId) {
    // 步骤1：理解问题
    this.displayStep1(messageId);
    
    // 步骤2：分析问题
    setTimeout(() => {
      this.displayStep2(messageId);
      
      // 显示结论
      setTimeout(() => {
        this.displayFinalResponse(question, messageId);
      }, 3000);
    }, 2500);
  },

  // 显示步骤1
  displayStep1(messageId) {
    const step1Title = "已理解问题并定位研究方向";
    const keywords = [
      { text: 'non-normality', checked: false },
      { text: 'extreme events', checked: false },
      { text: 'asset pricing', checked: false },
      { text: 'modeling', checked: false }
    ];
    
    // 逐字显示标题
    this.typeText(messageId, 'step1.title', step1Title, 80, () => {
      // 标题显示完成后，标记为选中
      this.setData({
        [`messages[${this.findMessageIndex(messageId)}].step1.checked`]: true
      });
      
      // 逐个显示关键词
      keywords.forEach((keyword, index) => {
        setTimeout(() => {
          const msgIndex = this.findMessageIndex(messageId);
          const keywordsPath = `messages[${msgIndex}].step1.keywords[${index}]`;
          this.setData({
            [keywordsPath]: {
              text: keyword.text,
              checked: true
            }
          });
        }, 300 * index);
      });
    });
  },

  // 显示步骤2
  displayStep2(messageId) {
    const step2Title = "已深入分析问题";
    const questions = [
      {
        text: "存在哪些适合捕捉极端事件的统计模型和方法？",
        keywords: [
          { text: 'statistical model', checked: false },
          { text: 'extreme events', checked: false },
          { text: 'copula', checked: false },
          { text: 'cluster analysis', checked: false },
          { text: 'autoencoder', checked: false },
          { text: 'GAN', checked: false }
        ]
      },
      {
        text: "如何在风险管理和投资分析中应用这些非正态建模技术？",
        keywords: [
          { text: 'risk management', checked: false },
          { text: 'investment analysis', checked: false },
          { text: 'non-normal modeling', checked: false },
          { text: 'financial modeling', checked: false }
        ]
      },
      {
        text: "非正态分布的资产价格有哪些典型特征？",
        keywords: [
          { text: 'non-normal distribution', checked: false },
          { text: 'asset pricing', checked: false }
        ]
      }
    ];
    
    // 逐字显示标题
    this.typeText(messageId, 'step2.title', step2Title, 80, () => {
      // 标题显示完成后，标记为选中
      this.setData({
        [`messages[${this.findMessageIndex(messageId)}].step2.checked`]: true
      });
      
      // 添加问题结构
      this.setData({
        [`messages[${this.findMessageIndex(messageId)}].step2.questions`]: questions.map(q => ({
          text: '',
          keywords: []
        }))
      });
      
      // 逐字显示子问题
      questions.forEach((q, qIndex) => {
        setTimeout(() => {
          this.typeText(messageId, `step2.questions[${qIndex}].text`, q.text, 50, () => {
            // 子问题显示完成后，显示关键词
            q.keywords.forEach((keyword, kIndex) => {
              setTimeout(() => {
                const msgIndex = this.findMessageIndex(messageId);
                const keywordPath = `messages[${msgIndex}].step2.questions[${qIndex}].keywords[${kIndex}]`;
                this.setData({
                  [keywordPath]: {
                    text: keyword.text,
                    checked: true
                  }
                });
              }, 200 * kIndex);
            });
          });
        }, 1500 * qIndex);
      });
    });
  },

  // 显示最终回复
  displayFinalResponse(question, messageId) {
    // 隐藏打字指示器
    this.setData({
      [`messages[${this.findMessageIndex(messageId)}].showTyping`]: false,
      [`messages[${this.findMessageIndex(messageId)}].type`]: 'conclusion',
      [`messages[${this.findMessageIndex(messageId)}].showConclusion`]: true
    });
    
    // 根据问题生成回复内容
    let response = '';
    
    if (question.includes('资产价格') || question.includes('非正态性')) {
      response = `
        <p>基于以上分析，<span class="highlight">资产价格的非正态性和极端事件建模</span>是金融风险管理中的重要课题。传统模型（如<span class="highlight">Black-Scholes模型</span>）假设资产回报服从正态分布，但实证研究表明，金融资产回报常呈现<span class="highlight">尖峰厚尾、偏斜</span>等非正态特征，且极端事件（如市场崩盘）发生频率远高于正态分布的预测。</p>
        
        <div class="citation">
          <div class="citation-title">常用建模方法：</div>
          <div class="citation-content">
            <p>1. <strong>极值理论（EVT）</strong>：直接对分布尾部的极端事件建模，不依赖于整体分布假设</p>
            <p>2. <strong>GARCH族模型</strong>：捕捉波动率聚类现象，如EGARCH处理杠杆效应</p>
            <p>3. <strong>跳跃扩散模型</strong>：在扩散过程中加入跳跃成分，模拟价格突变</p>
            <p>4. <strong>Copula函数</strong>：处理多变量间的非线性依赖结构</p>
            <p>5. <strong>机器学习方法</strong>：LSTM预测波动率，GAN生成极端情景</p>
          </div>
        </div>
        
        <p>此外，一些研究还探讨了使用机器学习方法进行资产定价，并认为机器学习能够更准确地模拟股票收益（Ding, 2024; Yu et al., 2020）。也有研究指出，传统的风险理论可能无法完全解释资产定价，而投资者情绪（如恐惧）可能是一个重要因素（Bali & Guirguis, 2007）。</p>
        
        <div class="related-searches">
          <div class="related-title">相关搜索</div>
          <div class="search-tags">
            <div class="search-tag">极端事件对资产价格的影响机制是什么？ <i class="fas fa-plus"></i></div>
            <div class="search-tag">如何用统计模型捕捉资产收益的厚尾特性？ <i class="fas fa-plus"></i></div>
            <div class="search-tag">非正态分布下如何改进传统的资产定价模型？ <i class="fas fa-plus"></i></div>
            <div class="search-tag">资产价格中的偏度和峰度风险如何度量？ <i class="fas fa-plus"></i></div>
            <div class="search-tag">极端天气事件对金融资产定价有何影响？ <i class="fas fa-plus"></i></div>
          </div>
        </div>
      `;
    } else if (question.includes('收入不平等')) {
      response = `
        <p>基于以上分析，<span class="highlight">收入不平等对社会稳定的影响</span>是一个复杂的多维度问题。研究表明，收入不平等通过多种机制影响社会稳定：</p>
        
        <div class="citation">
          <div class="citation-title">主要影响机制：</div>
          <div class="citation-content">
            <p>1. <strong>社会凝聚力下降</strong>：收入差距过大会削弱社会信任和凝聚力</p>
            <p>2. <strong>犯罪率上升</strong>：贫困和相对剥夺感可能导致财产犯罪增加</p>
            <p>3. <strong>政治不稳定</strong>：资源分配不公可能引发社会运动和政治动荡</p>
            <p>4. <strong>健康差距扩大</strong>：收入不平等与健康不平等密切相关</p>
            <p>5. <strong>代际流动性降低</strong>：高不平等社会往往伴随低社会流动性</p>
          </div>
        </div>
        
        <p>根据世界银行的研究（2023），基尼系数超过0.4的国家更容易出现社会不稳定。解决收入不平等问题需要综合政策，包括累进税制、教育机会均等、社会保障体系完善等措施。</p>
      `;
    } else if (question.includes('纳米材料')) {
      response = `
        <p>基于以上分析，<span class="highlight">纳米材料性能与尺度的关系</span>是纳米科技研究的核心问题。当材料尺寸减小到纳米尺度（1-100纳米）时，会出现显著的尺寸效应：</p>
        
        <div class="citation">
          <div class="citation-title">典型尺寸效应：</div>
          <div class="citation-content">
            <p>1. <strong>表面效应</strong>：比表面积增大，表面原子比例显著增加</p>
            <p>2. <strong>量子尺寸效应</strong>：能带结构变化导致光学、电学性质改变</p>
            <p>3. <strong>小尺寸效应</strong>：超顺磁性、熔点降低等特殊性质</p>
            <p>4. <strong>宏观量子隧道效应</strong>：纳米粒子具有穿越势垒的能力</p>
          </div>
        </div>
        
        <p>这些效应使纳米材料展现出独特的物理化学性质，如金纳米粒子在约20nm时呈现红色，而量子点在特定尺寸下可发射特定波长的荧光。通过精确控制纳米材料的尺寸和形貌，可以调控其光学、电学、磁学和催化性能。</p>
      `;
    } else {
      response = `
        <p>基于以上分析，<span class="highlight">铁硅合金涂层选择</span>需要考虑多种因素。铁硅合金（Fe-Si）因其优异的磁性能而广泛应用于电磁设备中。涂层选择需考虑以下关键因素：</p>
        
        <div class="citation">
          <div class="citation-title">涂层选择关键因素：</div>
          <div class="citation-content">
            <p>1. <strong>耐腐蚀性</strong>：在恶劣环境中保护基材</p>
            <p>2. <strong>热稳定性</strong>：保持高温下的性能稳定</p>
            <p>3. <strong>磁性能影响</strong>：涂层不应显著降低合金的磁导率</p>
            <p>4. <strong>界面结合强度</strong>：确保涂层与基材的良好结合</p>
            <p>5. <strong>成本效益</strong>：平衡性能与生产成本</p>
          </div>
        </div>
        
        <p>根据研究（Zhang et al., 2023），对于铁硅合金，推荐使用<span class="highlight">磷酸盐涂层</span>或<span class="highlight">硅烷基复合涂层</span>，这两种涂层在保持磁性能的同时提供了良好的耐腐蚀保护。在高温应用中，<span class="highlight">陶瓷基涂层</span>（如Al2O3）可能是更好的选择。</p>
      `;
    }
    
    // 逐字显示结论
    this.typeText(messageId, 'conclusionContent', response, 20);
  },

  // 查找消息索引
  findMessageIndex(messageId) {
    return this.data.messages.findIndex(msg => msg.id === messageId);
  },

  // 逐字显示文本的函数
  typeText(messageId, field, text, speed = 30, callback = null) {
    const msgIndex = this.findMessageIndex(messageId);
    if (msgIndex === -1) return;
    
    let index = 0;
    const fullText = text;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        this.setData({
          [`messages[${msgIndex}].${field}`]: fullText.substring(0, index + 1)
        });
        index++;
        this.setData({
          scrollToView: `msg${msgIndex}`
        });
      } else {
        clearInterval(timer);
        if (callback) callback();
      }
    }, speed);
  },
  
  // 生成AI回复（带逐字显示效果）
  generateAIResponse(question) {
    // 移除思考状态
    const messages = [...this.data.messages];
    messages.pop(); // 移除思考中的消息
    
    // 添加AI回复
    this.setData({
      messages: [...messages, {
        role: 'ai',
        content: '',
        thinking: false
      }],
      scrollTop: 99999
    });
    
    // 根据问题生成回复内容
    let response = '';
    if (question.includes('资产价格') || question.includes('非正态性')) {
      response = '资产价格的非正态性和极端事件建模是金融风险管理中的重要课题。传统模型（如Black-Scholes）假设资产回报服从正态分布，但实证研究表明，金融资产回报常呈现尖峰厚尾、偏斜等非正态特征，且极端事件（如市场崩盘）发生频率远高于正态分布的预测。';
    } else {
      response = '感谢您的科学问题！玻尔AI正在分析您的问题并准备专业回答。我们的系统整合了超过5,000万篇学术文献和最新研究成果，将为您提供深度、准确的科学解释。';
    }
    
    // 逐字显示效果
    let index = 0;
    const timer = setInterval(() => {
      if (index < response.length) {
        const lastMessage = this.data.messages[this.data.messages.length - 1];
        lastMessage.content = response.substring(0, index + 1);
        this.setData({
          messages: [...this.data.messages.slice(0, -1), lastMessage],
          scrollTop: 99999
        });
        index++;
      } else {
        clearInterval(timer);
      }
    }, 50);
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})