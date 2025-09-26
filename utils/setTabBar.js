function setTabBar(num) {
	if (typeof this.getTabBar === 'function' && this.getTabBar()) {
		this.getTabBar().setData({
			selected: num
		})
	}
}
module.exports = { 
	setTabBar
}