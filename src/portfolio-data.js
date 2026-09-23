export const workMedia = `${import.meta.env.BASE_URL}media/portfolio/`;
const asset = number => `p${String(number).padStart(2, '0')}`;
export const portfolioImage = (file, size = 'cover') => `${workMedia}${file}-${size}.webp`;
export const preview = (file, size = 'cover') => `${workMedia}${file.split('.')[0]}-${size}.webp`;

export const works = [
  { title: '蒙都 · 风干牛肉', category: '品牌包装', type: 'PACKAGING / BRANDING', tone: 'red', description: '草原、牛群与风景线描构成包装主视觉。展示单盒、三种口味组合、局部细节与陈列效果。', images: [23, 19, 28, 20].map(asset) },
  { title: '灵湖咖啡 App', category: '数字产品', type: 'UI / DIGITAL PRODUCT', tone: 'cream', description: '以温暖的咖啡色与清晰的信息层级组织移动界面。包含界面总览、首页、点单、结算与会员中心。', images: [30, 2, 3, 5, 6].map(asset) },
  { title: '豪士 · 藜麦吐司海报', category: '视觉海报', type: 'CAMPAIGN / POSTER', tone: 'cream', description: '两组吐司主题视觉：以童年想象表现松软与轻盈，以画框和谷物、麦穗、云朵构建“可食用的艺术”。', images: [1, 21, 22, 16, 17, 18].map(asset) },
  { title: '黑皮诺 · 酒标与礼盒', category: '品牌包装', type: 'LABEL / PACKAGING', tone: 'dark', description: '黑白酒标、猫形标识与深红内衬形成统一视觉。包含瓶身、礼盒正面及组合陈列。', images: [15, 13, 14].map(asset) },
  { title: '岩小宝 · 黄岩石窟 IP', category: 'IP角色', type: 'CHARACTER / IP DESIGN', tone: 'cream', description: '以黄岩石窟文化为灵感的角色形象，结合石窟纹样、双色发型与石锤。展示角色三视图、表情动作及主题海报。', images: [4, 9, 29].map(asset) },
  { title: '设计与光 · 视觉探索', category: '视觉海报', type: 'TYPOGRAPHY / POSTER', tone: 'cream', description: '围绕设计思考与弥散光展开排版探索，运用大字、几何形态、色彩叠加与颗粒质感组织画面。', images: [25, 26, 27].map(asset) },
  { title: '仙玉叶 · 茶礼', category: '品牌包装', type: 'TEA / PACKAGING', tone: 'olive', description: '书法字、留白与纸张肌理构成茶礼视觉，呈现两款礼盒的场景组合。', images: [24].map(asset) },
  { title: '牛栏坑肉桂 · 茶包装', category: '品牌包装', type: 'STRUCTURE / PACKAGING', tone: 'olive', description: '以层叠曲线塑造茶盒表面，结合压印文字与材质肌理。展示棕、绿两种配色及不同视角。', images: [12, 8, 10, 11].map(asset) },
  { title: '杞源 · 枸杞原浆', category: '品牌包装', type: 'GOJI / PACKAGING', tone: 'cream', description: '白色双盒与红色枸杞形态相互呼应，结合书法名称和金色信息，呈现原浆礼盒正面视觉。', images: [7].map(asset) },
];
export const workCategories = ['全部', '品牌包装', '数字产品', 'IP角色', '视觉海报'];
