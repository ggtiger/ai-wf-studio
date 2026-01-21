# Extension Resources

# 扩展资源说明

## Icon

## 图标（Icon）

The extension icon (`icon.png`) should be:

扩展图标（`icon.png`）建议满足以下要求：

- Size: 128x128 pixels  
  尺寸：128x128 像素
- Format: PNG with transparency  
  格式：带透明通道的 PNG
- Design: Represents workflow/automation (e.g., connected nodes, flowchart elements)  
  设计：体现“工作流 / 自动化”概念（例如：连接的节点、流程图元素）
- Colors: Professional, matches Claude branding if applicable  
  配色：风格专业，如有需要可尽量贴近 Claude 品牌色

### Icon Placeholder

### 图标占位说明

Currently using a placeholder. To add a custom icon:

当前仓库中使用的是占位图标。若要替换为自定义图标：

1. Create a 128x128 PNG image  
   设计并导出一张 128x128 的 PNG 图片
2. Save as `resources/icon.png`  
   将其保存为 `resources/icon.png`
3. The `package.json` is already configured to use it  
   根目录 `package.json` 已经配置好该路径，无需额外修改

### Design Suggestions

### 设计建议

- Visual workflow representation (nodes connected with arrows)  
  使用节点与箭头组成的可视化工作流图形
- Gear/cog with network connections  
  带有连线的齿轮 / 机械元素，体现“自动化”
- Flow diagram icon  
  常见的流程图图标
- Claude logo integrated with workflow elements  
  将 Claude 相关元素与工作流图形结合（如品牌允许）

---

**Note**: Actual icon file needs to be created by a designer or using design tools.  
**说明**：图标文件需要由设计师或使用设计工具单独制作，本仓库只提供占位与路径约定。
