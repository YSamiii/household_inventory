# Home Stock v0.4 — Root Fix

这是一次从根因重构的版本，不是继续追加 CSS patch。

## 根因修复
1. 删除旧的三列横向库存卡片结构。
2. 商品信息与数量操作改成两个独立布局区域，长名称不再与 `- 数量 +` 争抢同一行宽度。
3. 删除 `overflow-x:hidden` 作为“隐藏错误”的方案。
4. 删除 v0.2/v0.3 的叠加 override，CSS 从头整理为单一规则来源。
5. Modal 改为统一组件：右上角关闭、点击遮罩关闭、取消按钮均由同一生命周期控制。
6. Service Worker 使用新 cache namespace 并立即接管。

## 数据
v0.4 使用新的 localStorage key，避免旧原型脏数据/重复 fixture 干扰验证。
