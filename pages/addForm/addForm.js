// pages/addForm/addForm.js
Page({
  data: {
    formTitle: "活动报名表",
    fields: [],
    showComponentModal: false,
    showPropertyModal: false,
    showConditionModal: false,
    showDeleteConfirm: false,
    currentField: null,
    currentFieldIndex: null,
    fileTypes: ["任意文件", "仅图片", "仅文档"],
    isPreviewMode: false,
    formValues: {}, // 存储用户填写的表单值
    showToast: false,
    toastMessage: "",
    pendingDeleteIndex: -1, // 待删除的字段索引
    dependentFieldsCount: 0, // 关联字段数量

    // 条件逻辑相关数据
    availableFields: [],
    conditionFieldIndex: -1,
    selectedConditionField: null,
    conditionOperatorIndex: -1,
    selectedOperator: null,
    conditionValue: "",
    conditionValueType: "text",
    showConditionValue: true,
    isMultiSelect: false,
    showOptionSelector: false,
    optionSearch: "",
    filteredOptions: [],
    selectedOptions: [],
    selectedOptionText: "",
    
    // 操作符列表
    operators: [
      { value: "equals", text: "等于" },
      { value: "notEquals", text: "不等于" },
      {value: "contains", text: "包含" },
      { value: "notContains", text: "不包含" },
      { value: "empty", text: "为空" },
      { value: "notEmpty", text: "不为空" }
    ],
    
    // 拖拽相关状态
    dragItem: null,
    dragStartIndex: -1,
    dragOverIndex: -1,
    dragStartY: 0,
    dragOffsetY: 0,
    isDragging: false
  },

  onLoad: function() {
    // 初始化操作符
    this.setData({
      selectedOperator: this.data.operators[0]
    });
  },

  // 生成唯一ID
  generateFieldId: function() {
    return 'field_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  },

  // 切换预览模式
  togglePreviewMode: function() {
    const isPreviewMode = !this.data.isPreviewMode;
    
    if (isPreviewMode) {
      // 进入预览模式，初始化表单值和可见性
      const formValues = {};
      const fields = this.data.fields.map(field => {
        // 初始化字段值
        if (field.type === 'checkbox') {
          formValues[field.id] = [];
        } else {
          formValues[field.id] = '';
        }
        
        // 计算初始可见性
        return {
          ...field,
          isVisible: this.checkFieldVisibility(field, formValues)
        };
      });
      
      this.setData({
        isPreviewMode: true,
        fields: fields,
        formValues: formValues
      });
    } else {
      // 退出预览模式
      this.setData({
        isPreviewMode: false,
        formValues: {}
      });
    }
  },

  // 检查字段是否应该显示
  checkFieldVisibility: function(field, formValues) {
    if (!field.conditions || field.conditions.length === 0) {
      return true; // 没有条件限制，默认显示
    }
    
    // 检查所有条件，所有条件都必须满足
    return field.conditions.every(condition => {
      const fieldValue = formValues[condition.fieldId] || '';
      return this.checkCondition(condition, fieldValue);
    });
  },
  
  // 检查单个条件
  checkCondition: function(condition, fieldValue) {
    switch (condition.operator) {
      case 'equals':
        // 处理多选框的情况
        if (Array.isArray(fieldValue)) {
          // 将条件值拆分为数组
          const conditionValues = condition.value.split(',');
          // 比较两个数组是否包含相同的值（忽略顺序和重复项）
          const array1 = [...new Set(fieldValue)].sort();
          const array2 = [...new Set(conditionValues)].sort();
          return array1.length === array2.length && 
                 array1.every((value, index) => value === array2[index]);
        }
        return fieldValue === condition.value;
      case 'notEquals':
        // 处理多选框的情况
        if (Array.isArray(fieldValue)) {
          // 将条件值拆分为数组
          const conditionValues = condition.value.split(',');
          // 比较两个数组是否包含相同的值（忽略顺序和重复项）
          const array1 = [...new Set(fieldValue)].sort();
          const array2 = [...new Set(conditionValues)].sort();
          return !(array1.length === array2.length && 
            array1.every((value, index) => value === array2[index]));
        }
        return fieldValue !== condition.value;
      case 'contains':
        // 处理多选框的情况
        if (Array.isArray(fieldValue)) {
          return fieldValue.includes(condition.value);
        }
        return fieldValue.includes(condition.value);
      case 'notContains':
        // 处理多选框的情况
        if (Array.isArray(fieldValue)) {
          return !fieldValue.includes(condition.value);
        }
        return !fieldValue.includes(condition.value);
      case 'empty':
        return !fieldValue || fieldValue.length === 0;
      case 'notEmpty':
        return !!fieldValue && fieldValue.length > 0;
      default:
        return true;
    }
  },
  
  // 更新所有字段的可见性
  updateFieldVisibility: function() {
    const fields = this.data.fields.map(field => ({
      ...field,
      isVisible: this.checkFieldVisibility(field, this.data.formValues)
    }));
    
    this.setData({ fields });
  },

  onTitleInput: function(e) {
    this.setData({
      formTitle: e.detail.value
    });
  },

  // 字段输入事件
  onFieldInput: function(e) {
    const fieldId = e.currentTarget.dataset.id;
    const value = e.detail.value;
    
    this.setData({
      [`formValues.${fieldId}`]: value
    }, () => {
      // 输入完成后更新字段可见性
      this.updateFieldVisibility();
    });
  },
  
  // 字段变化事件（单选/多选）
  onFieldChange: function(e) {
    const fieldId = e.currentTarget.dataset.id;
    const value = e.detail.value;
    
    this.setData({
      [`formValues.${fieldId}`]: value
    }, () => {
      // 更新字段可见性
      this.updateFieldVisibility();
    });
  },
  
  // 多选框变化事件
  onCheckboxChange: function(e) {
    const fieldId = e.currentTarget.dataset.id;
    const value = e.detail.value; // 这是一个数组，包含所有选中的值
    
    this.setData({
      [`formValues.${fieldId}`]: value
    }, () => {
      // 更新字段可见性
      this.updateFieldVisibility();
    });
  },
  
  // 日期选择事件
  onDateChange: function(e) {
    const fieldId = e.currentTarget.dataset.id;
    const value = e.detail.value;
    
    this.setData({
      [`formValues.${fieldId}`]: value
    }, () => {
      // 更新字段可见性
      this.updateFieldVisibility();
    });
  },

  showComponentModal: function() {
    this.setData({
      showComponentModal: true
    });
  },

  hideComponentModal: function() {
    this.setData({
      showComponentModal: false
    });
  },

  selectComponentType: function(e) {
    const type = e.currentTarget.dataset.type;
    let initialField = {
      id: this.generateFieldId(),
      type: type,
      label: "未命名字段",
      required: true,
      placeholder: "请输入" + (type === "text" ? "文本" : type === "textarea" ? "多行文本" : ""),
      dragging: false,
      dragOver: false,
      showDropIndicator: false,
      conditions: [],
      isVisible: true
    };

    if (type === "radio" || type === "checkbox") {
      initialField.options = ["选项1", "选项2"];
    }

    if (type === "file") {
      initialField.fileType = "任意文件";
      initialField.fileTypeIndex = 0;
      initialField.multiple = false;
    }

    this.setData({
      showComponentModal: false,
      showPropertyModal: true,
      currentField: initialField,
      currentFieldIndex: null
    });
  },

  hidePropertyModal: function() {
    this.setData({
      showPropertyModal: false
    });
  },

  onLabelInput: function(e) {
    const currentField = this.data.currentField;
    currentField.label = e.detail.value;
    this.setData({
      currentField: currentField
    });
  },

  onPlaceholderInput: function(e) {
    const currentField = this.data.currentField;
    currentField.placeholder = e.detail.value;
    this.setData({
      currentField: currentField
    });
  },

  onRequiredChange: function(e) {
    const currentField = this.data.currentField;
    currentField.required = e.detail.value;
    this.setData({
      currentField: currentField
    });
  },

  onOptionInput: function(e) {
    const index = e.currentTarget.dataset.index;
    const value = e.detail.value;
    const currentField = this.data.currentField;
    currentField.options[index] = value;
    this.setData({
      currentField: currentField
    });
  },

  addOption: function() {
    const currentField = this.data.currentField;
    currentField.options.push("新选项");
    this.setData({
      currentField: currentField
    });
  },

  removeOption: function(e) {
    const index = e.currentTarget.dataset.index;
    const currentField = this.data.currentField;
    
    if (currentField.options.length > 1) {
      currentField.options.splice(index, 1);
      this.setData({
        currentField: currentField
      });
    }
  },

  onFileTypeChange: function(e) {
    const index = e.detail.value;
    const currentField = this.data.currentField;
    currentField.fileType = this.data.fileTypes[index];
    currentField.fileTypeIndex = index;
    this.setData({
      currentField: currentField
    });
  },

  onMultipleChange: function(e) {
    const currentField = this.data.currentField;
    currentField.multiple = e.detail.value;
    this.setData({
      currentField: currentField
    });
  },

  saveProperties: function() {
    const fields = this.data.fields;
    const currentField = this.data.currentField;
    
    if (this.data.currentFieldIndex !== null) {
      // 编辑现有字段
      fields[this.data.currentFieldIndex] = currentField;
    } else {
      // 添加新字段
      fields.push(currentField);
    }
    
    this.setData({
      fields: fields,
      showPropertyModal: false
    });
  },

  editField: function(e) {
    const index = e.currentTarget.dataset.index;
    const field = JSON.parse(JSON.stringify(this.data.fields[index]));
    
    this.setData({
      currentField: field,
      currentFieldIndex: index,
      showPropertyModal: true
    });
  },

  // 查找所有依赖指定字段的字段
  findDependentFields: function(fieldId) {
    const dependentFields = [];
    
    this.data.fields.forEach(field => {
      if (field.conditions && field.conditions.length > 0) {
        const hasDependency = field.conditions.some(condition => 
          condition.fieldId === fieldId
        );
        
        if (hasDependency) {
          dependentFields.push(field.id);
          // 递归查找依赖这个字段的其他字段
          const nestedDependencies = this.findDependentFields(field.id);
          dependentFields.push(...nestedDependencies);
        }
      }
    });
    
    return [...new Set(dependentFields)]; // 去重
  },

  deleteField: function(e) {
    const index = e.currentTarget.dataset.index;
    const fieldId = this.data.fields[index].id;
    
    // 查找所有依赖这个字段的字段
    const dependentFieldIds = this.findDependentFields(fieldId);
    
    if (dependentFieldIds.length > 0) {
      // 如果有依赖字段，显示确认对话框
      this.setData({
        showDeleteConfirm: true,
        pendingDeleteIndex: index,
        dependentFieldsCount: dependentFieldIds.length
      });
    } else {
      // 没有依赖字段，直接删除
      this.confirmDelete(e);
    }
  },

  cancelDelete: function() {
    this.setData({
      showDeleteConfirm: false,
      pendingDeleteIndex: -1,
      dependentFieldsCount: 0
    });
  },

  confirmDelete: function(e) {
    const index = (e.currentTarget.dataset.index != null) ? e.currentTarget.dataset.index : this.data.pendingDeleteIndex;
    const fieldId = this.data.fields[index].id;
    
    // 查找所有依赖这个字段的字段
    const dependentFieldIds = this.findDependentFields(fieldId);
    
    // 删除所有依赖字段
    let fields = [...this.data.fields];
    fields = fields.filter(field => 
      field.id !== fieldId && !dependentFieldIds.includes(field.id)
    );
    
    this.setData({
      fields: fields,
      showDeleteConfirm: false,
      pendingDeleteIndex: -1,
      dependentFieldsCount: 0
    });
  },

  // 条件逻辑相关方法
  addCondition: function() {
    // 准备可用的字段列表（排除当前字段）
    const availableFields = this.data.fields
      .filter((field, index) => index !== this.data.currentFieldIndex)
      .map(field => ({
        id: field.id,
        label: field.label,
        type: field.type
      }));
    
    this.setData({
      showConditionModal: true,
      availableFields: availableFields,
      conditionFieldIndex: -1,
      selectedConditionField: null,
      conditionOperatorIndex: 0,
      selectedOperator: this.data.operators[0],
      conditionValue: "",
      conditionValueType: "text",
      showConditionValue: true,
      isMultiSelect: false,
      showOptionSelector: false,
      optionSearch: "",
      filteredOptions: [],
      selectedOptions: [],
      selectedOptionText: ""
    });
  },

  removeCondition: function(e) {
    const index = e.currentTarget.dataset.index;
    const currentField = this.data.currentField;
    currentField.conditions.splice(index, 1);
    
    this.setData({
      currentField: currentField
    });
  },

  onConditionFieldChange: function(e) {
    const index = e.detail.value;
    const selectedField = this.data.availableFields[index];
    
    // 确定值输入类型
    let valueType = "text";
    let showValue = true;
    
    if (selectedField) {
      // 找到完整字段信息
      const fullField = this.data.fields.find(f => f.id === selectedField.id);
      
      if (fullField.type === "radio" || fullField.type === "checkbox") {
        valueType = "option";
      } else if (fullField.type === "date") {
        valueType = "date";
      } else if (fullField.type === "file") {
        // 文件类型只支持空值判断
        showValue = false;
        this.setData({
          conditionOperatorIndex: 4, // 默认为"为空"
          selectedOperator: this.data.operators[4]
        });
      }
      
      // 如果是选项类型，准备选项列表
      if (valueType === "option") {
        this.setData({
          filteredOptions: fullField.options || [],
          isMultiSelect: fullField.type === "checkbox"
        });
      }
    }
    
    this.setData({
      conditionFieldIndex: index,
      selectedConditionField: selectedField,
      conditionValueType: valueType,
      showConditionValue: showValue,
      conditionValue: "",
      selectedOptions: [],
      selectedOptionText: ""
    });
  },

  onConditionOperatorChange: function(e) {
    const index = e.detail.value;
    const operator = this.data.operators[index];
    
    this.setData({
      conditionOperatorIndex: index,
      selectedOperator: operator
    });
  },

  onConditionValueInput: function(e) {
    this.setData({
      conditionValue: e.detail.value
    });
  },

  onDateConditionChange: function(e) {
    this.setData({
      conditionValue: e.detail.value
    });
  },

  showOptionSelector: function() {
    this.setData({
      showOptionSelector: true
    });
  },

  onOptionSearch: function(e) {
    const searchText = e.detail.value.toLowerCase();
    const filtered = this.data.filteredOptions.filter(option => 
      option.toLowerCase().includes(searchText)
    );
    
    this.setData({
      optionSearch: e.detail.value,
      filteredOptions: filtered
    });
  },

  toggleOption: function(e) {
    const option = e.currentTarget.dataset.option;
    let selectedOptions = [...this.data.selectedOptions];
    
    if (this.data.isMultiSelect) {
      const index = selectedOptions.indexOf(option);
      if (index === -1) {
        selectedOptions.push(option);
      } else {
        selectedOptions.splice(index, 1);
      }
    } else {
      selectedOptions = [option];
    }
    
    this.setData({
      selectedOptions: selectedOptions,
      selectedOptionText: selectedOptions.join(", ")
    });
  },

  isOptionSelected: function(option) {
    return this.data.selectedOptions.includes(option);
  },

  removeSelectedOption: function(e) {
    const option = e.currentTarget.dataset.option;
    const selectedOptions = this.data.selectedOptions.filter(item => item !== option);
    
    this.setData({
      selectedOptions: selectedOptions,
      selectedOptionText: selectedOptions.join(", ")
    });
  },

  saveCondition: function() {
    const condition = {
      fieldId: this.data.selectedConditionField.id, // 使用字段ID而不是索引
      operator: this.data.selectedOperator.value,
      value: ""
    };
    
    // 处理不同类型的值
    if (this.data.conditionValueType === "option") {
      condition.value = this.data.selectedOptions.join(",");
    } else {
      condition.value = this.data.conditionValue;
    }
    
    // 添加到当前字段的条件列表
    const currentField = this.data.currentField;
    if (!currentField.conditions) {
      currentField.conditions = [];
    }
    currentField.conditions.push(condition);
    
    this.setData({
      currentField: currentField,
      showConditionModal: false
    });
  },

  hideConditionModal: function() {
    this.setData({
      showConditionModal: false
    });
  },

  // 拖拽功能实现
  onTouchStart: function(e) {
    if (this.data.isPreviewMode) {
      return
    }
    const index = e.currentTarget.dataset.index;
    const touch = e.touches[0];
    const query = wx.createSelectorQuery();
    
    query.select('#formContainer').boundingClientRect();
    query.exec((res) => {
      const containerTop = res[0].top;
      
      this.setData({
        dragItem: this.data.fields[index],
        dragStartIndex: index,
        dragOverIndex: index,
        dragStartY: touch.clientY - containerTop,
        dragOffsetY: touch.clientY - containerTop,
        isDragging: true
      });
      
      // 更新拖拽项状态
      const fields = this.data.fields.map((field, i) => {
        if (i === index) {
          return {...field, dragging: true};
        }
        return field;
      });
      
      this.setData({ fields });
    });
  },

  onTouchMove: function(e) {
    if (!this.data.isDragging) return;
    
    const touch = e.touches[0];
    const query = wx.createSelectorQuery();
    
    query.select('#formContainer').boundingClientRect();
    query.exec((res) => {
      const containerTop = res[0].top;
      const currentY = touch.clientY - containerTop;
      const deltaY = currentY - this.data.dragOffsetY;
      
      this.setData({
        dragOffsetY: currentY
      });
      
      // 计算当前悬停的索引
      const fieldHeight = 100; // 估算每个字段的高度
      const dragOverIndex = Math.round(currentY / fieldHeight);
      
      if (dragOverIndex >= 0 && dragOverIndex < this.data.fields.length && dragOverIndex !== this.data.dragOverIndex) {
        // 更新悬停指示器
        const fields = this.data.fields.map((field, i) => {
          if (i === this.data.dragOverIndex) {
            return {...field, dragOver: false, showDropIndicator: false};
          }
          if (i === dragOverIndex) {
            return {...field, dragOver: true, showDropIndicator: true};
          }
          return field;
        });
        
        this.setData({
          fields,
          dragOverIndex
        });
      }
    });
  },

  onTouchEnd: function(e) {
    if (!this.data.isDragging) return;
    
    const { dragStartIndex, dragOverIndex, fields } = this.data;
    
    if (dragStartIndex !== dragOverIndex && dragOverIndex >= 0 && dragOverIndex < fields.length) {
      // 重新排序数组
      const newFields = [...fields];
      const [movedItem] = newFields.splice(dragStartIndex, 1);
      newFields.splice(dragOverIndex, 0, movedItem);
      
      this.setData({
        fields: newFields.map(field => ({...field, dragging: false, dragOver: false, showDropIndicator: false}))
      });
    } else {
      // 恢复原始状态
      this.setData({
        fields: fields.map(field => ({...field, dragging: false, dragOver: false, showDropIndicator: false}))
      });
    }
    
    // 重置拖拽状态
    this.setData({
      dragItem: null,
      dragStartIndex: -1,
      dragOverIndex: -1,
      dragStartY: 0,
      dragOffsetY: 0,
      isDragging: false
    });
  },

  onTouchCancel: function(e) {
    // 拖拽取消，恢复原始状态
    const fields = this.data.fields.map(field => ({...field, dragging: false, dragOver: false, showDropIndicator: false}));
    
    this.setData({
      fields,
      dragItem: null,
      dragStartIndex: -1,
      dragOverIndex: -1,
      dragStartY: 0,
      dragOffsetY: 0,
      isDragging: false
    });
  },

  saveForm: function() {
    // 实际应用中这里应该调用wx.setStorageSync保存数据
    wx.setStorageSync('formData', {
      title: this.data.formTitle,
      fields: this.data.fields
    });
  },

  publishForm: function() {
    const formData = {
      title: this.data.formTitle,
      fields: this.data.fields
    };
    
    console.log('表单数据:', formData);
    
    // 实际应用中这里应该调用后端API
  },

  onFileUpload: function(e) {
    const index = e.currentTarget.dataset.index;
    const field = this.data.fields[index];
    
    wx.chooseMessageFile({
      count: field.multiple ? 9 : 1,
      type: field.fileType === "仅图片" ? "image" : field.fileType === "仅文档" ? "file" : "all",
      success: (res) => {
        console.log("上传文件:", res);
      }
    });
  }
});