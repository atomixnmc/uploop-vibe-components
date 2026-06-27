// ─── Component Showcase — 98 components, left-nav, live demos ─

import { html, component } from "@uploop/html";
import { inject } from "@uploop/css";
import {
  vibeLight,
  applyVibeTheme,
  injectVibeAnimations,
} from "@uploop-vibe/vibe";

applyVibeTheme(vibeLight);
injectVibeAnimations();
inject();

// ── Component Catalog ────────────────────────────────────────
// Each entry: { name, desc, demo (HTML string), code (usage string) }

const catalog = [
  {
    name: "Layout",
    icon: "📐",
    desc: "Structural building blocks for composing page layouts.",
    components: [
      {
        name: "Container",
        desc: "Centered max-width wrapper",
        demo: '<div style="background:#f0f4ff;border-radius:8px;text-align:center;padding:1.5rem;">Container (max-width: lg)</div>',
        code: "Container.create({ size:'lg', center:true })",
      },
      {
        name: "Grid",
        desc: "Responsive CSS grid",
        demo: '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:0.5rem;"><span style="padding:1rem;background:#f0f4ff;border-radius:6px;text-align:center;">1</span><span style="padding:1rem;background:#f0f4ff;border-radius:6px;text-align:center;">2</span><span style="padding:1rem;background:#f0f4ff;border-radius:6px;text-align:center;">3</span></div>',
        code: "Grid.create({ cols:3, gap:'md', responsive:true })",
      },
      {
        name: "Stack",
        desc: "Vertical/horizontal flex stack",
        demo: '<div style="display:flex;flex-direction:column;gap:0.5rem;"><span style="padding:0.5rem;background:#f0f4ff;border-radius:6px;">Top</span><span style="padding:0.5rem;background:#f0f4ff;border-radius:6px;">Bottom</span></div>',
        code: "Stack.create({ direction:'vertical', gap:'md' })",
      },
      {
        name: "Flex",
        desc: "Row flex with alignment",
        demo: '<div style="display:flex;gap:0.5rem;"><span style="padding:0.5rem 1rem;background:#f0f4ff;border-radius:6px;">A</span><span style="padding:0.5rem 1rem;background:#f0f4ff;border-radius:6px;">B</span></div>',
        code: "Flex.create({ gap:'md', align:'center' })",
      },
      {
        name: "Spacer",
        desc: "Vertical spacing",
        demo: '<div style="background:#f0f4ff;padding:1rem;border-radius:6px;">Above</div><div style="height:1.5rem;"></div><div style="background:#f0f4ff;padding:1rem;border-radius:6px;">Below</div>',
        code: "Spacer.create({ size:'lg' })",
      },
      {
        name: "Divider",
        desc: "Horizontal rule with label",
        demo: '<div style="display:flex;align-items:center;gap:1rem;"><hr style="flex:1;border:none;border-top:1px solid #ddd;"/><span style="color:#aaa;font-size:0.8rem;">OR</span><hr style="flex:1;border:none;border-top:1px solid #ddd;"/></div>',
        code: "Divider.create({ label:'OR' })",
      },
      {
        name: "Box",
        desc: "Generic style container",
        demo: '<div style="padding:1.5rem;background:#f0f4ff;border:1px solid #d0d8ff;border-radius:8px;text-align:center;">Box</div>',
        code: "Box.create({ padding:'1rem', bg:'primary50' })",
      },
      {
        name: "Center",
        desc: "Horizontally and vertically centers",
        demo: '<div style="display:flex;align-items:center;justify-content:center;padding:2rem;background:#f0f4ff;border-radius:8px;">Centered</div>',
        code: "Center.create({})",
      },
      {
        name: "AspectRatio",
        desc: "Fixed aspect ratio wrapper",
        demo: '<div style="position:relative;max-width:200px;margin:0 auto;"><div style="padding-bottom:56.25%;"></div><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:#f0f4ff;border-radius:8px;">16:9</div></div>',
        code: "AspectRatio.create({ ratio:'16/9' })",
      },
      {
        name: "Wrap",
        desc: "Flex wrap container",
        demo: '<div style="display:flex;flex-wrap:wrap;gap:0.4rem;"><span style="padding:0.2rem 0.6rem;background:#f0f4ff;border-radius:99px;font-size:0.8rem;">Tag</span><span style="padding:0.2rem 0.6rem;background:#f0f4ff;border-radius:99px;font-size:0.8rem;">Wrap</span></div>',
        code: "Wrap.create({ gap:'md' })",
      },
      {
        name: "SkipNav",
        desc: "Accessibility skip link",
        demo: '<a href="#" style="display:inline-block;padding:0.4rem 0.8rem;background:#646cff;color:white;border-radius:6px;font-size:0.8rem;text-decoration:none;">Skip to content</a>',
        code: "SkipNav.create({ href:'#main' })",
      },
      {
        name: "BackToTop",
        desc: "Back-to-top button",
        demo: '<button style="width:2.5rem;height:2.5rem;border-radius:50%;border:1px solid #ddd;background:white;display:flex;align-items:center;justify-content:center;font-size:1.2rem;">\u2191</button>',
        code: "BackToTop.create({ threshold:300 })",
      },
    ],
  },
  {
    name: "Navigation",
    icon: "🧭",
    desc: "Menus, links, tabs, breadcrumbs, pagination.",
    components: [
      {
        name: "Nav",
        desc: "Horizontal/vertical nav links",
        demo: '<div style="display:flex;gap:0.5rem;"><span style="padding:0.4rem 0.8rem;border-radius:6px;background:#f0f4ff;color:#646cff;font-size:0.85rem;font-weight:600;">Home</span><span style="padding:0.4rem 0.8rem;font-size:0.85rem;color:#888;">About</span><span style="padding:0.4rem 0.8rem;font-size:0.85rem;color:#888;">Contact</span></div>',
        code: "Nav.create({ items:[{id:'home',label:'Home'},{id:'about',label:'About'}] })",
      },
      {
        name: "Dropdown",
        desc: "Dropdown action menu",
        demo: '<button style="padding:0.4rem 0.8rem;border:1px solid #ddd;border-radius:6px;background:white;display:inline-flex;align-items:center;gap:0.3rem;font-size:0.85rem;cursor:pointer;">Actions <span>&#9660;</span></button>',
        code: "Dropdown.create({ items:[{id:'edit',label:'Edit'}], trigger:'Actions' })",
      },
      {
        name: "Tabs",
        desc: "Tab bar with variants",
        demo: '<div style="display:flex;border-bottom:1px solid #e0e0e0;"><button style="padding:0.5rem 0.75rem;border:none;background:transparent;border-bottom:2px solid #646cff;color:#646cff;font-weight:600;cursor:pointer;font-size:0.85rem;">Active</button><button style="padding:0.5rem 0.75rem;border:none;background:transparent;border-bottom:2px solid transparent;color:#888;cursor:pointer;font-size:0.85rem;">Tab 2</button></div>',
        code: "Tabs.create({ tabs:[{id:'a',label:'Active'},{id:'b',label:'Tab 2'}] })",
      },
      {
        name: "Breadcrumb",
        desc: "Breadcrumb trail",
        demo: '<nav style="display:flex;align-items:center;gap:0.3rem;font-size:0.8rem;"><span style="color:#888;">Home</span><span style="color:#ccc;">/</span><span style="color:#888;">Products</span><span style="color:#ccc;">/</span><span style="color:#333;font-weight:600;">Detail</span></nav>',
        code: "Breadcrumb.create({ items:[{label:'Home',href:'/'},{label:'Page'}] })",
      },
      {
        name: "Link",
        desc: "Styled anchor link",
        demo: '<a href="#" style="color:#646cff;text-decoration:none;font-size:0.85rem;font-weight:500;">Documentation \u2192</a>',
        code: "Link.create({ href:'/docs', label:'Docs', external:true })",
      },
      {
        name: "Pagination",
        desc: "Page navigation",
        demo: '<div style="display:flex;gap:0.25rem;"><button style="min-width:1.75rem;height:1.75rem;border:1px solid #646cff;border-radius:4px;background:#646cff;color:white;font-size:0.75rem;">1</button><button style="min-width:1.75rem;height:1.75rem;border:1px solid #ddd;border-radius:4px;background:white;color:#555;font-size:0.75rem;">2</button><button style="min-width:1.75rem;height:1.75rem;border:1px solid #ddd;border-radius:4px;background:white;color:#555;font-size:0.75rem;">3</button></div>',
        code: "Pagination.create({ page:1, total:5 })",
      },
      {
        name: "Stepper",
        desc: "Step progress indicator",
        demo: '<div style="display:flex;align-items:center;gap:0;font-size:0.75rem;"><span style="width:1.5rem;height:1.5rem;border-radius:50%;background:#40c057;color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.65rem;">\u2713</span><span style="margin:0 0.5rem;color:#aaa;">Details</span><div style="width:2rem;height:2px;background:#40c057;"></div><span style="width:1.5rem;height:1.5rem;border-radius:50%;background:#646cff;color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.65rem;">2</span><span style="margin:0 0.5rem;font-weight:600;">Shipping</span><div style="width:2rem;height:2px;background:#e0e0e0;"></div><span style="width:1.5rem;height:1.5rem;border-radius:50%;border:2px solid #e0e0e0;color:#aaa;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.65rem;">3</span><span style="margin:0 0.5rem;color:#aaa;">Done</span></div>',
        code: "Stepper.create({ steps:[{label:'Details'},{label:'Shipping'},{label:'Done'}], active:1 })",
      },
      {
        name: "ContextMenu",
        desc: "Right-click menu",
        demo: '<div style="padding:0.5rem;border:1px solid #ddd;border-radius:8px;max-width:10rem;background:white;box-shadow:0 2px 8px rgba(0,0,0,0.1);"><button style="display:block;width:100%;padding:0.3rem 0.5rem;border:none;background:transparent;text-align:left;font-size:0.8rem;cursor:pointer;">Copy</button><button style="display:block;width:100%;padding:0.3rem 0.5rem;border:none;background:transparent;text-align:left;font-size:0.8rem;cursor:pointer;">Paste</button></div>',
        code: "ContextMenu.create({ items:[{id:'copy',label:'Copy'}] })",
      },
      {
        name: "CommandPalette",
        desc: "Cmd+K style palette",
        demo: '<div style="padding:0.5rem;border:1px solid #ddd;border-radius:10px;max-width:16rem;background:white;box-shadow:0 4px 16px rgba(0,0,0,0.1);"><div style="display:flex;align-items:center;gap:0.5rem;padding:0.3rem 0.5rem;"><span>\u2318</span><input value="search..." readonly style="border:none;outline:none;flex:1;font-size:0.8rem;background:transparent;"/></div></div>',
        code: "CommandPalette.create({ groups:[{label:'Actions',items:[{id:'new',label:'New'}]}] })",
      },
      {
        name: "ScrollSpy",
        desc: "Scroll position tracker",
        demo: '<div style="border-left:2px solid #e0e0e0;padding-left:0.5rem;"><span style="display:block;padding:0.2rem 0;font-size:0.8rem;color:#646cff;border-left:2px solid #646cff;padding-left:0.5rem;margin-left:-0.5rem;font-weight:600;">Intro</span><span style="display:block;padding:0.2rem 0;font-size:0.8rem;color:#888;">Features</span></div>',
        code: "ScrollSpy.create({ items:[{id:'intro',label:'Intro'},{id:'api',label:'API'}] })",
      },
    ],
  },
  {
    name: "Data Entry",
    icon: "✏️",
    desc: "Forms, inputs, toggles, sliders, pickers — full user input toolkit.",
    components: [
      {
        name: "Input",
        desc: "Text input with label/error/hint",
        demo: '<div><label style="display:block;font-size:0.8rem;font-weight:500;color:#888;margin-bottom:0.2rem;">Email</label><input placeholder="you@example.com" style="padding:0.5rem 0.75rem;border:1px solid #ddd;border-radius:6px;width:100%;font-size:0.85rem;"/></div>',
        code: "Input.create({ label:'Email', type:'email', placeholder:'you@example.com' })",
      },
      {
        name: "Textarea",
        desc: "Multi-line text input",
        demo: '<textarea placeholder="Write something..." rows="3" style="padding:0.5rem;border:1px solid #ddd;border-radius:6px;width:100%;font-size:0.85rem;resize:vertical;"></textarea>',
        code: "Textarea.create({ label:'Bio', rows:4 })",
      },
      {
        name: "Select",
        desc: "Dropdown select",
        demo: '<select style="padding:0.5rem;border:1px solid #ddd;border-radius:6px;width:100%;font-size:0.85rem;"><option>Select role...</option><option>Developer</option><option>Designer</option></select>',
        code: "Select.create({ options:[{value:'dev',label:'Developer'}] })",
      },
      {
        name: "Checkbox",
        desc: "Toggle checkbox",
        demo: '<label style="display:flex;align-items:center;gap:0.5rem;cursor:pointer;"><input type="checkbox" checked style="accent-color:#646cff;"/><span style="font-size:0.85rem;">I agree to terms</span></label>',
        code: "Checkbox.create({ label:'I agree', checked:true })",
      },
      {
        name: "Radio",
        desc: "Radio button group",
        demo: '<div style="display:flex;flex-direction:column;gap:0.25rem;"><label style="display:flex;align-items:center;gap:0.4rem;cursor:pointer;"><input type="radio" name="demo" checked style="accent-color:#646cff;"/><span style="font-size:0.85rem;">Option A</span></label><label style="display:flex;align-items:center;gap:0.4rem;cursor:pointer;"><input type="radio" name="demo" style="accent-color:#646cff;"/><span style="font-size:0.85rem;">Option B</span></label></div>',
        code: "Radio.create({ name:'group', value:'a', label:'Option A' })",
      },
      {
        name: "Switch",
        desc: "Toggle switch",
        demo: '<div style="display:inline-block;width:2.5rem;height:1.4rem;border-radius:99px;background:#646cff;position:relative;"><div style="position:absolute;top:0.15rem;right:0.15rem;width:1.1rem;height:1.1rem;border-radius:50%;background:white;box-shadow:0 1px 3px rgba(0,0,0,0.2);"></div></div>',
        code: "Switch.create({ checked:true, label:'Enable' })",
      },
      {
        name: "Slider",
        desc: "Range slider",
        demo: '<input type="range" value="60" style="width:100%;accent-color:#646cff;"/>',
        code: "Slider.create({ value:50, min:0, max:100, showValue:true })",
      },
      {
        name: "NumberInput",
        desc: "Number stepper",
        demo: '<div style="display:flex;"><button style="padding:0.3rem 0.6rem;border:1px solid #ddd;border-radius:4px 0 0 4px;background:white;">\u2212</button><input value="5" style="width:3rem;text-align:center;border:1px solid #ddd;border-left:none;border-right:none;font-size:0.85rem;"/><button style="padding:0.3rem 0.6rem;border:1px solid #ddd;border-radius:0 4px 4px 0;background:white;">+</button></div>',
        code: "NumberInput.create({ value:5, min:0, max:100 })",
      },
      {
        name: "SearchInput",
        desc: "Search with icon",
        demo: '<div style="position:relative;"><span style="position:absolute;left:0.5rem;top:50%;transform:translateY(-50%);">\uD83D\uDD0D</span><input placeholder="Search..." style="padding:0.5rem 0.5rem 0.5rem 2rem;border:1px solid #ddd;border-radius:99px;width:100%;font-size:0.85rem;"/></div>',
        code: "SearchInput.create({ placeholder:'Search...', clearable:true })",
      },
      {
        name: "PinInput",
        desc: "OTP/pin code input",
        demo: '<div style="display:flex;gap:0.5rem;justify-content:center;"><div style="width:2.5rem;height:2.5rem;border:2px solid #646cff;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:600;">\u2022</div><div style="width:2.5rem;height:2.5rem;border:2px solid #646cff;border-radius:6px;display:flex;align-items:center;justify-content:center;font-weight:600;">\u2022</div><div style="width:2.5rem;height:2.5rem;border:2px solid #ddd;border-radius:6px;display:flex;align-items:center;justify-content:center;"></div><div style="width:2.5rem;height:2.5rem;border:2px solid #ddd;border-radius:6px;display:flex;align-items:center;justify-content:center;"></div></div>',
        code: "PinInput.create({ length:4, mask:true })",
      },
      {
        name: "ColorPicker",
        desc: "Color picker with presets",
        demo: '<div style="display:flex;align-items:center;gap:0.5rem;"><div style="width:2rem;height:2rem;border-radius:6px;background:#646cff;border:2px solid #ddd;"></div><code style="font-size:0.85rem;">#646cff</code></div>',
        code: "ColorPicker.create({ value:'#646cff', showSwatch:true })",
      },
      {
        name: "FileUpload",
        desc: "Drag-drop file upload",
        demo: '<div style="padding:1.5rem;border:2px dashed #ddd;border-radius:8px;text-align:center;"><div style="font-size:1.5rem;">\uD83D\uDCC1</div><div style="font-size:0.85rem;color:#888;">Drop files here</div></div>',
        code: "FileUpload.create({ accept:'image/*', multiple:true })",
      },
      {
        name: "TagInput",
        desc: "Tag/token input",
        demo: '<div style="display:flex;flex-wrap:wrap;gap:0.3rem;padding:0.3rem;border:1px solid #ddd;border-radius:6px;"><span style="padding:0.1rem 0.4rem;background:#f0f4ff;border-radius:99px;font-size:0.8rem;">React</span><span style="padding:0.1rem 0.4rem;background:#f0f4ff;border-radius:99px;font-size:0.8rem;">Vue</span></div>',
        code: "TagInput.create({ tags:['React','Vue'], maxTags:10 })",
      },
      {
        name: "Rating",
        desc: "Star/icon rating",
        demo: '<div style="display:flex;gap:0.1rem;font-size:1.2rem;color:#fab005;">\u2605\u2605\u2605\u2605\u2606</div>',
        code: "Rating.create({ value:4, max:5, icon:'star' })",
      },
      {
        name: "Combobox",
        desc: "Searchable select",
        demo: '<div style="display:flex;border:1px solid #ddd;border-radius:6px;"><input placeholder="Select..." style="flex:1;padding:0.5rem;border:none;outline:none;font-size:0.85rem;"/><button style="padding:0 0.5rem;border:none;border-left:1px solid #ddd;background:transparent;color:#888;">\u25BC</button></div>',
        code: "Combobox.create({ options:[{value:'a',label:'Alpha'}], searchable:true })",
      },
      {
        name: "SegmentedControl",
        desc: "Segmented button group",
        demo: '<div style="display:inline-flex;padding:0.2rem;background:#f0f0f0;border-radius:8px;"><button style="padding:0.3rem 0.8rem;border:none;border-radius:6px;background:white;font-size:0.8rem;box-shadow:0 1px 3px rgba(0,0,0,0.1);">Day</button><button style="padding:0.3rem 0.8rem;border:none;border-radius:6px;background:transparent;font-size:0.8rem;">Week</button></div>',
        code: "SegmentedControl.create({ options:[{value:'day',label:'Day'}], value:'day' })",
      },
    ],
  },
  {
    name: "Data Display",
    icon: "📋",
    desc: "Cards, tables, lists, timelines, stats — present information clearly.",
    components: [
      {
        name: "Card",
        desc: "Container card with slots",
        demo: '<div style="padding:1rem;background:white;border:1px solid #e0e0e0;border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,0.05);"><div style="font-weight:600;margin-bottom:0.5rem;">Card Title</div><div style="font-size:0.85rem;color:#888;">Content goes here</div></div>',
        code: "Card.create({ padding:'md', shadow:'sm' })",
      },
      {
        name: "Badge",
        desc: "Status badge with variants",
        demo: '<div style="display:flex;gap:0.4rem;"><span style="padding:0.15rem 0.5rem;background:#d3f9d8;color:#2b8a3e;border-radius:99px;font-size:0.75rem;font-weight:500;">Active</span><span style="padding:0.15rem 0.5rem;background:#fff3bf;color:#e67700;border-radius:99px;font-size:0.75rem;font-weight:500;">Pending</span></div>',
        code: "Badge.create({ label:'Active', color:'success' })",
      },
      {
        name: "Avatar",
        desc: "User avatar with initials",
        demo: '<div style="width:2.5rem;height:2.5rem;border-radius:50%;background:#e0e0ff;display:flex;align-items:center;justify-content:center;font-weight:600;color:#646cff;font-size:0.85rem;">JD</div>',
        code: "Avatar.create({ name:'Jane Doe', size:'md' })",
      },
      {
        name: "Table",
        desc: "Data table with features",
        demo: '<table style="width:100%;border-collapse:collapse;font-size:0.8rem;"><tr style="border-bottom:2px solid #e0e0e0;"><th style="text-align:left;padding:0.4rem 0.5rem;color:#888;">Name</th><th style="text-align:left;padding:0.4rem 0.5rem;color:#888;">Role</th></tr><tr><td style="padding:0.4rem 0.5rem;">Alice</td><td style="padding:0.4rem 0.5rem;">Admin</td></tr><tr style="background:#f9f9fb;"><td style="padding:0.4rem 0.5rem;">Bob</td><td style="padding:0.4rem 0.5rem;">Editor</td></tr></table>',
        code: "Table.create({ columns:[{key:'name',label:'Name'}], rows:[], striped:true })",
      },
      {
        name: "List",
        desc: "Ordered/unordered list",
        demo: '<ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:0.3rem;"><li style="display:flex;align-items:flex-start;gap:0.4rem;font-size:0.85rem;"><span style="color:#646cff;">\u2022</span>First item</li><li style="display:flex;align-items:flex-start;gap:0.4rem;font-size:0.85rem;"><span style="color:#646cff;">\u2022</span>Second item</li></ul>',
        code: "List.create({ items:['Item 1','Item 2'], divider:true })",
      },
      {
        name: "Timeline",
        desc: "Vertical event timeline",
        demo: '<div style="padding-left:1.5rem;border-left:2px solid #e0e0e0;"><div style="position:relative;margin-bottom:1rem;"><div style="position:absolute;left:-1.65rem;top:0.15rem;width:0.6rem;height:0.6rem;border-radius:50%;background:#40c057;"></div><div style="font-weight:600;font-size:0.8rem;">Started</div><div style="font-size:0.75rem;color:#888;">Project kickoff</div></div><div style="position:relative;"><div style="position:absolute;left:-1.65rem;top:0.15rem;width:0.6rem;height:0.6rem;border-radius:50%;background:#e0e0e0;"></div><div style="font-weight:600;font-size:0.8rem;">Review</div></div></div>',
        code: "Timeline.create({ items:[{title:'Started',time:'Jan 1'},{title:'Review'}] })",
      },
      {
        name: "TreeView",
        desc: "Expandable tree",
        demo: '<div style="font-size:0.8rem;"><div style="padding:0.15rem 0.5rem;">\uD83D\uDCC1 src</div><div style="padding:0.15rem 0.5rem;padding-left:1.5rem;">\uD83D\uDCC4 index.js</div><div style="padding:0.15rem 0.5rem;padding-left:1.5rem;">\uD83D\uDCC4 app.js</div></div>',
        code: "TreeView.create({ items:[{id:'src',label:'src',children:[{id:'index',label:'index.js'}]}] })",
      },
      {
        name: "Stat",
        desc: "KPI stat display",
        demo: '<div style="padding:0.75rem;"><div style="font-size:0.7rem;color:#888;text-transform:uppercase;">Total Users</div><div style="display:flex;align-items:baseline;gap:0.5rem;"><span style="font-size:1.5rem;font-weight:700;">12,843</span><span style="font-size:0.8rem;color:#40c057;">\u2191 12%</span></div></div>',
        code: "Stat.create({ label:'Revenue', value:'$34,290', trend:'up' })",
      },
      {
        name: "DescriptionList",
        desc: "Term-description pairs",
        demo: '<dl style="display:grid;grid-template-columns:auto 1fr;gap:0;font-size:0.85rem;"><dt style="font-weight:600;padding:0.3rem 0.5rem 0.3rem 0;">Name</dt><dd style="margin:0;padding:0.3rem 0;color:#888;">Alice</dd><dt style="font-weight:600;padding:0.3rem 0.5rem 0.3rem 0;">Role</dt><dd style="margin:0;padding:0.3rem 0;color:#888;">Admin</dd></dl>',
        code: "DescriptionList.create({ items:[{term:'Name',description:'Alice'}], horizontal:true })",
      },
      {
        name: "Accordion",
        desc: "Collapsible sections",
        demo: '<div style="border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;"><div style="border-bottom:1px solid #e0e0e0;"><button style="display:flex;justify-content:space-between;width:100%;padding:0.6rem 0.8rem;border:none;background:transparent;cursor:pointer;font-size:0.85rem;font-weight:600;">Section 1 <span>\u25B2</span></button><div style="padding:0.6rem 0.8rem;font-size:0.8rem;color:#888;">Expanded content</div></div><div><button style="display:flex;justify-content:space-between;width:100%;padding:0.6rem 0.8rem;border:none;background:transparent;cursor:pointer;font-size:0.85rem;">Section 2 <span>\u25BC</span></button></div></div>',
        code: "Accordion.create({ items:[{id:'a',title:'Section 1'},{id:'b',title:'Section 2'}] })",
      },
      {
        name: "Carousel",
        desc: "Content/image carousel",
        demo: '<div style="position:relative;overflow:hidden;border-radius:8px;background:#f0f4ff;padding:2rem;text-align:center;">Slide 1 of 3<div style="position:absolute;bottom:0.5rem;left:50%;transform:translateX(-50%);display:flex;gap:0.3rem;"><div style="width:1rem;height:0.4rem;border-radius:99px;background:white;"></div><div style="width:0.4rem;height:0.4rem;border-radius:99px;background:rgba(255,255,255,0.5);"></div><div style="width:0.4rem;height:0.4rem;border-radius:99px;background:rgba(255,255,255,0.5);"></div></div></div>',
        code: "Carousel.create({ slides:['Slide 1','Slide 2'], showDots:true })",
      },
    ],
  },
  {
    name: "Feedback",
    icon: "💬",
    desc: "Alerts, toasts, spinners, progress, empty states — keep users informed.",
    components: [
      {
        name: "Toast",
        desc: "Corner notification",
        demo: '<div style="padding:0.5rem 1rem;background:#646cff;color:white;border-radius:8px;display:inline-flex;align-items:center;gap:0.5rem;font-size:0.8rem;">\u2713 Operation successful <span style="cursor:pointer;opacity:0.7;">\u00D7</span></div>',
        code: "Toast.create({ message:'Saved!', variant:'success', duration:3000 })",
      },
      {
        name: "Skeleton",
        desc: "Loading placeholder",
        demo: '<div style="display:flex;flex-direction:column;gap:0.5rem;"><div style="height:0.6rem;width:100%;border-radius:99px;background:#eee;"></div><div style="height:0.6rem;width:75%;border-radius:99px;background:#eee;"></div><div style="height:0.6rem;width:50%;border-radius:99px;background:#eee;"></div></div>',
        code: "Skeleton.create({ width:'80%', count:3 })",
      },
      {
        name: "Progress",
        desc: "Progress bar",
        demo: '<div style="width:100%;height:0.5rem;background:#eee;border-radius:99px;overflow:hidden;"><div style="width:65%;height:100%;background:#646cff;border-radius:99px;"></div></div>',
        code: "Progress.create({ value:65, showLabel:true })",
      },
      {
        name: "Alert",
        desc: "Inline alert banner",
        demo: '<div style="padding:0.6rem 1rem;background:#f0f4ff;border:1px solid #bac8ff;border-radius:8px;display:flex;gap:0.5rem;font-size:0.8rem;color:#364fc7;"><span>\u2139</span><span>A new version is available.</span></div>',
        code: "Alert.create({ message:'Update available', variant:'info' })",
      },
      {
        name: "Notification",
        desc: "Accent-bar notification",
        demo: '<div style="padding:0.6rem 1rem;background:white;border-left:3px solid #40c057;border-radius:6px;box-shadow:0 2px 8px rgba(0,0,0,0.1);font-size:0.8rem;">File uploaded</div>',
        code: "Notification.create({ message:'Uploaded', variant:'success' })",
      },
      {
        name: "Banner",
        desc: "Full-width sticky banner",
        demo: '<div style="padding:0.5rem 1rem;background:#646cff;color:white;text-align:center;font-size:0.8rem;display:flex;align-items:center;justify-content:center;gap:1rem;">We use cookies <button style="padding:0.2rem 0.6rem;border:1px solid white;border-radius:99px;background:transparent;color:white;font-size:0.75rem;cursor:pointer;">Accept</button></div>',
        code: "Banner.create({ message:'We use cookies', action:{label:'Accept'} })",
      },
      {
        name: "Spinner",
        desc: "Loading spinner",
        demo: '<div style="display:flex;align-items:center;gap:0.5rem;"><div style="width:1.5rem;height:1.5rem;border:2px solid #eee;border-top-color:#646cff;border-radius:50%;animation:spin 0.6s linear infinite;"></div><span style="font-size:0.8rem;color:#888;">Loading...</span></div>',
        code: "Spinner.create({ size:'md', label:'Loading...' })",
      },
      {
        name: "EmptyState",
        desc: "Empty state placeholder",
        demo: '<div style="text-align:center;padding:1.5rem;"><div style="font-size:2rem;">\uD83D\uDCED</div><h3 style="font-size:1rem;">Nothing here</h3><p style="font-size:0.8rem;color:#888;">Create your first item to get started.</p></div>',
        code: "EmptyState.create({ icon:'\uD83D\uDCED', title:'No items' })",
      },
      {
        name: "ErrorState",
        desc: "Error state with retry",
        demo: '<div style="text-align:center;padding:1.5rem;"><div style="font-size:2rem;">\u26A0</div><h3 style="color:#fa5252;font-size:1rem;">Something went wrong</h3><button style="padding:0.4rem 1rem;background:#646cff;color:white;border:none;border-radius:6px;cursor:pointer;">Try Again</button></div>',
        code: "ErrorState.create({ message:'Failed to load.' })",
      },
      {
        name: "LoadingOverlay",
        desc: "Full-area loading",
        demo: '<div style="position:relative;padding:2rem;background:#f9f9fb;border-radius:8px;text-align:center;"><div style="display:flex;flex-direction:column;align-items:center;gap:0.5rem;"><div style="width:2rem;height:2rem;border:3px solid #eee;border-top-color:#646cff;border-radius:50%;animation:spin 0.6s linear infinite;"></div><span style="font-size:0.8rem;color:#888;">Loading...</span></div></div>',
        code: "LoadingOverlay.create({ visible:true, message:'Loading...' })",
      },
      {
        name: "Result",
        desc: "Result page",
        demo: '<div style="text-align:center;padding:1rem;"><div style="font-size:3rem;">\u2705</div><h2 style="color:#40c057;">Success</h2><p style="color:#888;font-size:0.85rem;">Operation completed.</p></div>',
        code: "Result.create({ status:'success', title:'Done!' })",
      },
      {
        name: "Spotlight",
        desc: "Onboarding tour step",
        demo: '<div style="max-width:18rem;padding:1rem;background:white;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.15);text-align:center;"><div style="font-size:0.7rem;color:#aaa;">Step 1 of 3</div><h3>Welcome!</h3><p style="font-size:0.8rem;color:#888;">Let\'s get started.</p><button style="padding:0.4rem 1rem;background:#646cff;color:white;border:none;border-radius:6px;cursor:pointer;font-weight:600;">Next</button></div>',
        code: "Spotlight.create({ title:'Welcome!', step:0, total:3 })",
      },
    ],
  },
  {
    name: "Overlay",
    icon: "🪟",
    desc: "Modals, drawers, popovers, tooltips — layered UI for focused interactions.",
    components: [
      {
        name: "Modal",
        desc: "Center-screen dialog",
        demo: '<div style="max-width:18rem;padding:1rem;background:white;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.2);"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem;"><h3 style="margin:0;">Modal</h3><span style="cursor:pointer;font-size:1.2rem;">\u00D7</span></div><p style="font-size:0.8rem;color:#888;margin:0;">Content here</p></div>',
        code: "Modal.create({ title:'Confirm', size:'md' })",
      },
      {
        name: "Dialog",
        desc: "Confirmation dialog",
        demo: '<div style="max-width:16rem;padding:1rem;background:white;border-radius:10px;box-shadow:0 4px 20px rgba(0,0,0,0.2);"><h3 style="margin:0 0 0.5rem;">Delete?</h3><p style="font-size:0.8rem;color:#888;margin:0 0 0.75rem;">This cannot be undone.</p><div style="display:flex;justify-content:flex-end;gap:0.5rem;"><button style="padding:0.3rem 0.8rem;border:1px solid #ddd;border-radius:6px;background:transparent;cursor:pointer;">Cancel</button><button style="padding:0.3rem 0.8rem;background:#fa5252;color:white;border:none;border-radius:6px;cursor:pointer;">Delete</button></div></div>',
        code: "Dialog.create({ title:'Delete?', message:'Cannot undo.', variant:'danger' })",
      },
      {
        name: "Tooltip",
        desc: "Hover tooltip",
        demo: '<div style="position:relative;display:inline-block;"><span style="border-bottom:1px dotted #888;">Hover me</span><span style="position:absolute;bottom:100%;left:50%;transform:translateX(-50%);padding:0.3rem 0.6rem;background:#333;color:white;border-radius:4px;font-size:0.75rem;white-space:nowrap;margin-bottom:0.3rem;">Tooltip text</span></div>',
        code: "Tooltip.create({ text:'Helpful info', position:'top' })",
      },
      {
        name: "Drawer",
        desc: "Slide-in panel",
        demo: '<div style="max-width:14rem;padding:1rem;background:white;border-radius:10px 0 0 10px;box-shadow:-4px 0 20px rgba(0,0,0,0.1);"><h3 style="margin:0 0 0.5rem;">Drawer</h3><p style="font-size:0.8rem;color:#888;margin:0;">Slide from right</p></div>',
        code: "Drawer.create({ title:'Filters', placement:'right' })",
      },
      {
        name: "Sheet",
        desc: "Bottom sheet",
        demo: '<div style="max-width:18rem;padding:1rem 1rem 2rem;background:white;border-radius:16px 16px 0 0;box-shadow:0 -4px 20px rgba(0,0,0,0.1);"><div style="width:2rem;height:0.2rem;background:#ddd;border-radius:99px;margin:0 auto 0.5rem;"></div><p style="text-align:center;font-size:0.85rem;">Bottom Sheet</p></div>',
        code: "Sheet.create({ title:'Actions', placement:'bottom' })",
      },
      {
        name: "Popover",
        desc: "Click/hover floating card",
        demo: '<div style="position:relative;display:inline-block;"><button style="padding:0.3rem 0.8rem;border:1px solid #ddd;border-radius:6px;background:white;cursor:pointer;font-size:0.85rem;">Click</button><div style="position:absolute;top:100%;left:50%;transform:translateX(-50%);padding:0.5rem;background:white;border:1px solid #ddd;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);margin-top:0.3rem;font-size:0.8rem;white-space:nowrap;">Popover content</div></div>',
        code: "Popover.create({ content:'Hello!', trigger:'click' })",
      },
      {
        name: "HoverCard",
        desc: "Hover preview card",
        demo: '<div style="display:inline-block;padding:0.5rem 0.8rem;background:white;border:1px solid #ddd;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);"><div style="font-weight:600;font-size:0.8rem;">Preview</div><div style="font-size:0.75rem;color:#888;">Details here</div></div>',
        code: "HoverCard.create({ content:'Preview content', placement:'top' })",
      },
      {
        name: "Lightbox",
        desc: "Full-screen image viewer",
        demo: '<div style="padding:2rem;background:#1a1a2e;border-radius:8px;text-align:center;color:white;">\uD83D\uDDBC<div style="font-size:0.8rem;opacity:0.7;margin-top:0.5rem;">Caption</div></div>',
        code: "Lightbox.create({ src:'/image.jpg', caption:'Beautiful photo' })",
      },
      {
        name: "FullscreenOverlay",
        desc: "Full-viewport overlay",
        demo: '<div style="padding:2rem;background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);border-radius:8px;text-align:center;color:white;">Overlay content</div>',
        code: "FullscreenOverlay.create({ visible:true, blur:true })",
      },
    ],
  },
  {
    name: "Typography",
    icon: "🔤",
    desc: "Headings, text, labels, code blocks, quotes — consistent type hierarchy.",
    components: [
      {
        name: "Heading",
        desc: "h1-h6 with configurable weight",
        demo: '<h2 style="font-weight:800;margin:0;">Heading h2</h2><p style="font-size:0.8rem;color:#888;margin:0.25rem 0 0;">Subtitle text</p>',
        code: "Heading.create({ level:'h2', text:'Section Title', weight:'bold' })",
      },
      {
        name: "Text",
        desc: "Paragraph with truncation",
        demo: '<p style="font-size:0.85rem;color:#555;line-height:1.5;margin:0;">Configurable text component with size, color, weight, and alignment options.</p>',
        code: "Text.create({ text:'Hello', size:'base', truncate:true })",
      },
      {
        name: "Label",
        desc: "Form label with required marker",
        demo: '<label style="font-size:0.8rem;font-weight:500;color:#888;">Email <span style="color:#fa5252;">*</span></label>',
        code: "Label.create({ text:'Email', htmlFor:'email', required:true })",
      },
      {
        name: "Caption",
        desc: "Small descriptive text",
        demo: '<span style="font-size:0.75rem;color:#aaa;">Updated 2 hours ago</span>',
        code: "Caption.create({ text:'Updated 2 hours ago' })",
      },
      {
        name: "Highlight",
        desc: "Inline highlighted text",
        demo: '<p style="font-size:0.85rem;margin:0;">This is <mark style="background:#fff3bf;padding:0.1rem 0.2rem;border-radius:2px;">highlighted</mark> text.</p>',
        code: "Highlight.create({ text:'important', color:'warning' })",
      },
      {
        name: "Code",
        desc: "Inline code",
        demo: '<code style="font-family:monospace;background:#f0f0f0;padding:0.1rem 0.3rem;border-radius:3px;font-size:0.85em;color:#fa5252;">const x = 42;</code>',
        code: "Code.create({ code:'const x = 42;' })",
      },
      {
        name: "BlockCode",
        desc: "Multi-line code block",
        demo: '<pre style="background:#1e1e2e;color:#cdd6f4;padding:0.8rem;border-radius:8px;font-family:monospace;font-size:0.75rem;overflow-x:auto;margin:0;">function hello() {\n  return "world";\n}</pre>',
        code: "BlockCode.create({ code:'function hello() {\\n  return \"world\";\\n}', language:'js' })",
      },
      {
        name: "Kbd",
        desc: "Keyboard key indicator",
        demo: '<div style="display:flex;gap:0.3rem;align-items:center;"><kbd style="padding:0.1rem 0.4rem;font-family:monospace;font-size:0.8em;background:#f0f0f0;border:1px solid #ddd;border-bottom-width:2px;border-radius:3px;">\u2318</kbd><span style="color:#ccc;">+</span><kbd style="padding:0.1rem 0.4rem;font-family:monospace;font-size:0.8em;background:#f0f0f0;border:1px solid #ddd;border-bottom-width:2px;border-radius:3px;">K</kbd></div>',
        code: "Kbd.create({ keys:['\u2318','K'] })",
      },
      {
        name: "Blockquote",
        desc: "Styled block quotation",
        demo: '<blockquote style="margin:0;padding:0.6rem 1rem;border-left:3px solid #646cff;background:#f0f4ff;border-radius:0 6px 6px 0;font-style:italic;color:#888;">"The only limit is your imagination."<cite style="display:block;margin-top:0.3rem;font-style:normal;font-size:0.8rem;">\u2014 Someone</cite></blockquote>',
        code: "Blockquote.create({ text:'Great quote.', cite:'Author' })",
      },
    ],
  },
  {
    name: "Media",
    icon: "🖼",
    desc: "Images, video, audio, figures — rich media with fallbacks and styling.",
    components: [
      {
        name: "Icon",
        desc: "Icon wrapper with animations",
        demo: '<span style="display:inline-flex;align-items:center;justify-content:center;font-size:1.5rem;">\u2B50</span>',
        code: "Icon.create({ name:'star', size:'lg' })",
      },
      {
        name: "Image",
        desc: "Responsive image with fallback",
        demo: '<div style="width:8rem;height:5rem;background:#f0f4ff;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#888;font-size:0.8rem;">Image</div>',
        code: "Image.create({ src:'/photo.jpg', alt:'Photo', fit:'cover' })",
      },
      {
        name: "Video",
        desc: "Video player",
        demo: '<div style="background:#1a1a2e;border-radius:8px;padding:1.5rem;text-align:center;color:white;">\u25B6 Video Player</div>',
        code: "Video.create({ src:'/video.mp4', controls:true })",
      },
      {
        name: "Audio",
        desc: "Audio player",
        demo: '<div style="width:100%;height:2rem;background:#f0f4ff;border-radius:8px;display:flex;align-items:center;padding:0 0.5rem;font-size:0.8rem;">\uD83C\uDFB5 Audio Player</div>',
        code: "Audio.create({ src:'/audio.mp3', controls:true })",
      },
      {
        name: "Figure",
        desc: "Semantic figure with caption",
        demo: '<figure style="margin:0;max-width:12rem;"><div style="background:#f0f4ff;border-radius:8px;padding:2rem 1rem;text-align:center;font-size:0.8rem;color:#888;">Figure</div><figcaption style="margin-top:0.3rem;font-size:0.75rem;color:#888;text-align:center;">Caption</figcaption></figure>',
        code: "Figure.create({ src:'/diagram.png', caption:'Diagram' })",
      },
      {
        name: "AvatarGroup",
        desc: "Overlapping avatar group",
        demo: '<div style="display:flex;"><div style="width:2rem;height:2rem;border-radius:50%;background:#e0e0ff;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:0.65rem;color:#555;border:2px solid white;">JD</div><div style="width:2rem;height:2rem;border-radius:50%;background:#ffe0e0;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:0.65rem;color:#555;border:2px solid white;margin-left:-0.5rem;">AK</div><div style="width:2rem;height:2rem;border-radius:50%;background:#eee;display:flex;align-items:center;justify-content:center;font-size:0.6rem;color:#888;border:2px solid white;margin-left:-0.5rem;">+2</div></div>',
        code: "AvatarGroup.create({ avatars:[{name:'Jane'},{name:'Alex'},{name:'Sam'}], max:2 })",
      },
    ],
  },
  {
    name: "Utility",
    icon: "🔧",
    desc: "Portal, transitions, focus traps — low-level utilities for advanced patterns.",
    components: [
      {
        name: "Portal",
        desc: "Render into different DOM node",
        demo: '<div style="padding:0.5rem;border:1px dashed #ddd;border-radius:6px;font-size:0.8rem;text-align:center;">Portal target</div>',
        code: "Portal.create({ target:'body' })",
      },
      {
        name: "Transition",
        desc: "Enter/exit animation wrapper",
        demo: '<div style="padding:1rem;background:#f0f4ff;border-radius:8px;text-align:center;">Fade transition</div>',
        code: "Transition.create({ show:true, enter:'fade-in', exit:'fade-out' })",
      },
      {
        name: "FocusTrap",
        desc: "Keyboard focus containment",
        demo: '<div style="padding:1rem;border:2px solid #646cff;border-radius:8px;text-align:center;font-size:0.8rem;">Focus trapped area</div>',
        code: "FocusTrap.create({ active:true })",
      },
      {
        name: "ClickOutside",
        desc: "Outside click detection",
        demo: '<div style="padding:1rem;background:#f0f4ff;border-radius:8px;text-align:center;font-size:0.8rem;">Click outside me</div>',
        code: "ClickOutside.create({ enabled:true })",
      },
      {
        name: "LazyLoad",
        desc: "Deferred viewport rendering",
        demo: '<div style="padding:1rem;background:#f0f4ff;border-radius:8px;text-align:center;font-size:0.8rem;color:#888;">Lazy loaded content</div>',
        code: "LazyLoad.create({ placeholder:'Loading...' })",
      },
    ],
  },
  {
    name: "DataViz",
    icon: "📊",
    desc: "Sparklines, gauges, stat cards, trend indicators — lightweight visualization.",
    components: [
      {
        name: "Sparkline",
        desc: "Mini inline chart",
        demo: '<svg width="100" height="30" style="display:block;"><path d="M5,25 L25,15 L50,20 L75,5 L95,10" fill="none" stroke="#646cff" stroke-width="1.5" stroke-linecap="round"/></svg>',
        code: "Sparkline.create({ data:[10,25,15,40,30], width:120, height:40 })",
      },
      {
        name: "Gauge",
        desc: "Circular percentage gauge",
        demo: '<svg width="80" height="80" style="transform:rotate(-90deg);"><circle cx="40" cy="40" r="32" fill="none" stroke="#eee" stroke-width="6"/><circle cx="40" cy="40" r="32" fill="none" stroke="#646cff" stroke-width="6" stroke-dasharray="150" stroke-dashoffset="50" stroke-linecap="round"/></svg>',
        code: "Gauge.create({ value:65, size:120, label:'CPU' })",
      },
      {
        name: "StatsCard",
        desc: "KPI card with trend",
        demo: '<div style="padding:1rem;border:1px solid #e0e0e0;border-radius:10px;border-top:3px solid #646cff;"><div style="display:flex;justify-content:space-between;"><span style="font-size:0.7rem;color:#888;text-transform:uppercase;">Revenue</span><span>\uD83D\uDCC8</span></div><div style="display:flex;align-items:baseline;gap:0.5rem;margin-top:0.3rem;"><span style="font-size:1.5rem;font-weight:700;">$34K</span><span style="font-size:0.8rem;color:#40c057;">\u2191 12%</span></div></div>',
        code: "StatsCard.create({ label:'Revenue', value:'$34,290', trend:'up' })",
      },
      {
        name: "TrendIndicator",
        desc: "Directional trend arrow",
        demo: '<span style="color:#40c057;font-weight:500;font-size:0.85rem;">\u2191 12.5%</span>',
        code: "TrendIndicator.create({ value:12.5, direction:'up' })",
      },
    ],
  },
  {
    name: "Button",
    icon: "🔘",
    desc: "8 variants × 5 sizes × icon support × loading × animation.",
    components: [
      {
        name: "Button",
        desc: "Solid variant, medium size",
        demo: '<div style="display:flex;gap:0.5rem;flex-wrap:wrap;"><button style="padding:0.5rem 1.25rem;background:#646cff;color:white;border:none;border-radius:8px;font-weight:500;cursor:pointer;">Solid</button><button style="padding:0.5rem 1.25rem;background:transparent;color:#646cff;border:1px solid #646cff;border-radius:8px;font-weight:500;cursor:pointer;">Outline</button><button style="padding:0.5rem 1.25rem;background:transparent;color:#646cff;border:none;border-radius:8px;font-weight:500;cursor:pointer;">Ghost</button><button style="padding:0.5rem 1.25rem;background:#fa5252;color:white;border:none;border-radius:8px;font-weight:500;cursor:pointer;">Danger</button></div>',
        code: "Button.create({ label:'Click Me', variant:'solid', size:'md' })",
      },
    ],
  },
];

// ── Showcase App ─────────────────────────────────────────────





// ── Render helpers (vanilla DOM, no Uploop child components) ─

function renderSidebar(state) {
  let html = '<a href="/" style="display:block;padding:0.25rem 0.75rem;font-size:0.72rem;color:#aaa;text-decoration:none;">← Back</a>'
  html += '<div style="padding:0.25rem 0.75rem 0.5rem;"><div style="font-size:0.9rem;font-weight:800;">🎨 Components</div><div style="font-size:0.7rem;color:#aaa;">98 components · 10 categories</div></div>'
  catalog.forEach(function(c) {
    html += '<div><div style="font-size:0.62rem;font-weight:700;text-transform:uppercase;letter-spacing:0.8px;color:#aaa;padding:0.6rem 0.75rem 0.15rem;">' + c.icon + ' ' + c.name + '</div>'
    c.components.forEach(function(ci) {
      var active = state.component === ci.name && state.category === c.name
      var nameEscaped = ci.name.replace(/'/g, "\\x27")
      html += '<button onclick="window.__selectVibeComponent(\'' + nameEscaped + '\')" style="display:block;width:100%;text-align:left;padding:0.3rem 0.75rem;border:none;background:' + (active ? '#f0f0ff' : 'transparent') + ';font-size:0.78rem;cursor:pointer;color:' + (active ? '#646cff' : '#555') + ';border-left:2px solid ' + (active ? '#646cff' : 'transparent') + ';font-weight:' + (active ? '600' : '400') + ';">' + ci.name + '</button>'
    })
    html += '</div>'
  })
  return html
}

function renderContent(state) {
  var cat = catalog.find(function(c) { return c.name === state.category }) || catalog[0]
  var comp = cat.components.find(function(c) { return c.name === state.component }) || cat.components[0]
  var codeDisplay = comp.code.indexOf('(') > -1 ? comp.code.substring(comp.code.indexOf('(') + 1, comp.code.lastIndexOf(')')) : '// see HOWTO.md'

  var tagsHtml = cat.components.map(function(c) {
    var active = c.name === state.component
    return '<span style="padding:0.1rem 0.4rem;background:' + (active ? '#646cff' : '#e8e8ed') + ';color:' + (active ? 'white' : '#666') + ';border-radius:99px;font-size:0.68rem;font-weight:500;">' + c.name + '</span>'
  }).join('')

  return '<div style="max-width:720px;">' +
    '<div style="margin-bottom:1.5rem;">' +
      '<div style="display:flex;align-items:center;gap:0.5rem;margin-bottom:0.25rem;">' +
        '<span style="font-size:1.5rem;">' + cat.icon + '</span>' +
        '<span><h1 style="font-size:1.4rem;font-weight:800;margin:0;">' + comp.name + '</h1>' +
        '<span style="font-size:0.72rem;color:#aaa;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;">' + cat.name + '</span></span>' +
      '</div>' +
      '<p style="color:#888;font-size:0.85rem;margin:0.5rem 0 0;">' + comp.desc + '</p>' +
    '</div>' +
    '<div style="margin-bottom:1.5rem;padding:1rem;background:#f9f9fb;border-radius:10px;">' +
      '<div style="font-size:0.78rem;color:#888;margin-bottom:0.25rem;">Category overview</div>' +
      '<p style="margin:0;font-size:0.85rem;color:#555;line-height:1.5;">' + cat.desc + '</p>' +
      '<div style="margin-top:0.5rem;display:flex;flex-wrap:wrap;gap:0.3rem;">' + tagsHtml + '</div>' +
    '</div>' +
    '<div style="margin-bottom:1.5rem;">' +
      '<h3 style="font-size:0.75rem;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.5rem;">Demo</h3>' +
      '<div style="background:white;border:1px solid #e8e8ed;border-radius:12px;padding:1.5rem;min-height:80px;display:flex;align-items:center;">' + comp.demo + '</div>' +
    '</div>' +
    '<div>' +
      '<h3 style="font-size:0.75rem;color:#aaa;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.5rem;">Code</h3>' +
      '<pre style="background:#1e1e2e;color:#cdd6f4;padding:1rem;border-radius:8px;font-family:\'JetBrains Mono\',\'Fira Code\',monospace;font-size:0.75rem;overflow-x:auto;line-height:1.6;margin:0;">' +
      '<span style="color:#c792ea;">import</span> { ' + comp.name + ' } <span style="color:#c792ea;">from</span> <span style="color:#c3e88d;">\'@uploop-vibe/vibe\'</span>\n\n' +
      '<span style="color:#82aaff;">' + comp.name + '</span>.create({\n  ' + codeDisplay + '\n}).mount(el)</pre>' +
    '</div>' +
  '</div>'
}

// ── Simple shared state with direct DOM updates ──────────────
var _appState = { category: 'Layout', component: 'Container' }
var _sidebarEl = null
var _contentEl = null

function updateUI() {
  if (_sidebarEl) _sidebarEl.innerHTML = renderSidebar(_appState)
  if (_contentEl) _contentEl.innerHTML = renderContent(_appState)
}

window.__selectVibeComponent = function(name) {
  var parentCat = catalog.find(function(cat) { return cat.components.some(function(ci) { return ci.name === name }) })
  _appState = { component: name, category: parentCat ? parentCat.name : _appState.category }
  updateUI()
}

// ── ShowcaseApp — static shell, mounts via vanilla DOM ──────
const ShowcaseApp = component("ShowcaseApp", {
  state: {},

  view: function() {
    return '<div style="display:flex;min-height:100vh;">' +
      '<nav id="showcase-sidebar" style="width:260px;flex-shrink:0;background:white;border-right:1px solid #e8e8ed;padding:0.75rem 0;overflow-y:auto;position:sticky;top:0;height:100vh;"></nav>' +
      '<main id="showcase-content" style="flex:1;padding:2rem;overflow-y:auto;"></main>' +
    '</div>'
  },

  mount: function(el) {
    _sidebarEl = el.querySelector('#showcase-sidebar')
    _contentEl = el.querySelector('#showcase-content')
    updateUI()
  }
})

ShowcaseApp.mount(document.getElementById("app"));

// ── Make demos interactive ───────────────────────────────────
let _demoCleanups = []

function setupDemoInteractivity() {
  // Clean up previous interactivity
  _demoCleanups.forEach(fn => { try { fn() } catch(e) {} })
  _demoCleanups = []

  // Button click counter
  const demoBtns = document.querySelectorAll('.vibe-demo-btn')
  const clickCounter = document.getElementById('vibe-demo-click-count')
  if (demoBtns.length && clickCounter) {
    let count = 0
    const handlers = []
    demoBtns.forEach(btn => {
      const handler = () => { count++; clickCounter.textContent = 'Clicked: ' + count + 'x' }
      btn.addEventListener('click', handler)
      handlers.push(() => btn.removeEventListener('click', handler))
    })
    _demoCleanups.push(() => handlers.forEach(h => h()))
  }

  // Input live preview
  const demoInput = document.getElementById('vibe-demo-input')
  const inputPreview = document.getElementById('vibe-demo-input-preview')
  if (demoInput && inputPreview) {
    const handler = () => { inputPreview.textContent = demoInput.value ? 'You typed: ' + demoInput.value : '' }
    demoInput.addEventListener('input', handler)
    _demoCleanups.push(() => demoInput.removeEventListener('input', handler))
  }

  // Switch toggle
  const demoSwith = document.getElementById('vibe-demo-switch')
  const switchTrack = document.getElementById('vibe-demo-switch-track')
  const switchDot = document.getElementById('vibe-demo-switch-dot')
  const switchLabel = document.getElementById('vibe-demo-switch-label')
  if (demoSwith && switchTrack && switchDot && switchLabel) {
    const handler = () => {
      const on = demoSwith.checked
      switchTrack.style.background = on ? '#646cff' : '#ccc'
      switchDot.style.left = on ? '' : '0.15rem'
      switchDot.style.right = on ? '0.15rem' : ''
      switchLabel.textContent = on ? 'Enabled' : 'Disabled'
    }
    demoSwith.addEventListener('change', handler)
    _demoCleanups.push(() => demoSwith.removeEventListener('change', handler))
  }

  // Slider value display
  const demoSlider = document.getElementById('vibe-demo-slider')
  const sliderValue = document.getElementById('vibe-demo-slider-value')
  if (demoSlider && sliderValue) {
    const handler = () => { sliderValue.textContent = demoSlider.value }
    demoSlider.addEventListener('input', handler)
    _demoCleanups.push(() => demoSlider.removeEventListener('input', handler))
  }

  // Tabs
  const demoTabs = document.getElementById('vibe-demo-tabs')
  const tabContent = document.getElementById('vibe-demo-tab-content')
  if (demoTabs && tabContent) {
    const tabContents = ['Content for Tab 1', 'Content for Tab 2', 'Content for Tab 3']
    const handler = (e) => {
      const tabBtn = e.target.closest('.vibe-demo-tab')
      if (!tabBtn) return
      const idx = parseInt(tabBtn.getAttribute('data-tab'))
      demoTabs.querySelectorAll('.vibe-demo-tab').forEach((b, i) => {
        b.style.borderBottomColor = i === idx ? '#646cff' : 'transparent'
        b.style.color = i === idx ? '#646cff' : '#888'
        b.style.fontWeight = i === idx ? '600' : '400'
      })
      tabContent.textContent = tabContents[idx] || ''
    }
    demoTabs.addEventListener('click', handler)
    _demoCleanups.push(() => demoTabs.removeEventListener('click', handler))
  }
}

setupDemoInteractivity()
