// ─── @uploop-vibe/vibe Components — Public API ────────────────
// 100+ categorized components, AI-intent ready.

// ── Layout (12) ──────────────────────────────────────────────

import { Container, Grid, Stack, Flex, Spacer, Divider } from '../layout/grid.js'
import { Box, Center, AspectRatio, Wrap, SkipNav, BackToTop } from './layout/basics.js'

export {
  Container, Grid, Stack, Flex, Spacer, Divider,
  Box, Center, AspectRatio, Wrap, SkipNav, BackToTop,
}

// ── Navigation (12) ──────────────────────────────────────────

import { Nav } from './data.js'
import { Dropdown } from './data.js'
import { Tabs } from './tabs.js'
import { Breadcrumb, Link, Pagination, Stepper } from './navigation/nav-extras.js'
import { ContextMenu, CommandPalette, ScrollSpy } from './navigation/menu-extras.js'

export {
  Nav, Dropdown, Tabs,
  Breadcrumb, Link, Pagination, Stepper,
  ContextMenu, CommandPalette, ScrollSpy,
}

// ── Data Entry (18) ──────────────────────────────────────────

import { Input, Textarea, Select, Checkbox } from './input.js'
import { Radio, Switch, Slider, NumberInput, SearchInput } from './data-entry/basic.js'
import { PinInput, ColorPicker, FileUpload, TagInput, Rating, Combobox, SegmentedControl } from './data-entry/advanced.js'

export {
  Input, Textarea, Select, Checkbox,
  Radio, Switch, Slider, NumberInput, SearchInput,
  PinInput, ColorPicker, FileUpload, TagInput, Rating, Combobox, SegmentedControl,
}

// ── Data Display (16) ────────────────────────────────────────

import { Card, CardHeader, CardBody, CardFooter } from './card.js'
import { Badge, Avatar } from './badge.js'
import { Table } from './data.js'
import { List, Timeline, TreeView, Stat, DescriptionList, Accordion, Carousel } from './data-display/display.js'

export {
  Card, CardHeader, CardBody, CardFooter,
  Badge, Avatar,
  Table,
  List, Timeline, TreeView, Stat, DescriptionList, Accordion, Carousel,
}

// ── Feedback (14) ────────────────────────────────────────────

import { Toast } from './toast.js'
import { Skeleton, Progress } from './feedback.js'
import { Alert, Notification, Banner, Spinner, EmptyState, ErrorState, LoadingOverlay, Result, Spotlight } from './feedback/status.js'

export {
  Toast, Skeleton, Progress,
  Alert, Notification, Banner, Spinner, EmptyState, ErrorState, LoadingOverlay, Result, Spotlight,
}

// ── Overlay (10) ─────────────────────────────────────────────

import { Modal, Dialog, Tooltip } from './toast.js'
import { Drawer, Sheet, Popover, HoverCard, Lightbox, FullscreenOverlay } from './overlay/overlays.js'

export {
  Modal, Dialog, Tooltip,
  Drawer, Sheet, Popover, HoverCard, Lightbox, FullscreenOverlay,
}

// ── Typography (10) ──────────────────────────────────────────

import { Heading, Text, Label, Caption, Highlight, Code, BlockCode, Kbd, Blockquote } from './typography/text.js'

export {
  Heading, Text, Label, Caption, Highlight, Code, BlockCode, Kbd, Blockquote,
}

// ── Media (6) ────────────────────────────────────────────────

import { Icon } from './feedback.js'
import { Image, Video, Audio, Figure, AvatarGroup } from './media/media.js'

export {
  Icon, Image, Video, Audio, Figure, AvatarGroup,
}

// ── Utility (5) ──────────────────────────────────────────────

import { Portal, Transition, FocusTrap, ClickOutside, LazyLoad } from './utility/helpers.js'

export {
  Portal, Transition, FocusTrap, ClickOutside, LazyLoad,
}

// ── DataViz (4) ──────────────────────────────────────────────

import { Sparkline, Gauge, StatsCard, TrendIndicator } from './dataviz/charts.js'

export {
  Sparkline, Gauge, StatsCard, TrendIndicator,
}

// ── Button ───────────────────────────────────────────────────

import { DatePicker, DateRangePicker } from './datepicker.js'
import { Button } from './button.js'
export { Button, DatePicker, DateRangePicker }

// ── Component Registry (for AI intent resolution) ────────────

export const componentRegistry = {
  DatePicker, DateRangePicker,
  // Layout (12)
  Container, Grid, Stack, Flex, Spacer, Divider,
  Box, Center, AspectRatio, Wrap, SkipNav, BackToTop,
  // Navigation (12)
  Nav, Dropdown, Tabs, Breadcrumb, Link, Pagination, Stepper,
  ContextMenu, CommandPalette, ScrollSpy,
  // Data Entry (18)
  Input, Textarea, Select, Checkbox,
  Radio, Switch, Slider, NumberInput, SearchInput,
  PinInput, ColorPicker, FileUpload, TagInput, Rating, Combobox, SegmentedControl,
  // Data Display (16)
  Card, CardHeader, CardBody, CardFooter,
  Badge, Avatar, Table,
  List, Timeline, TreeView, Stat, DescriptionList, Accordion, Carousel,
  // Feedback (14)
  Toast, Skeleton, Progress,
  Alert, Notification, Banner, Spinner, EmptyState, ErrorState, LoadingOverlay, Result, Spotlight,
  // Overlay (10)
  Modal, Dialog, Tooltip,
  Drawer, Sheet, Popover, HoverCard, Lightbox, FullscreenOverlay,
  // Typography (10)
  Heading, Text, Label, Caption, Highlight, Code, BlockCode, Kbd, Blockquote,
  // Media (6)
  Icon, Image, Video, Audio, Figure, AvatarGroup,
  // Utility (5)
  Portal, Transition, FocusTrap, ClickOutside, LazyLoad,
  // DataViz (4)
  Sparkline, Gauge, StatsCard, TrendIndicator,
  // Button
  Button,
}

/**
 * Resolve a component by name from the registry.
 * @param {string} name - e.g. "Button", "Card", "Input"
 * @returns {Function|undefined} component descriptor
 */
export function getComponent(name) {
  return componentRegistry[name]
}

/**
 * List all available component names, optionally filtered by category.
 * @param {string} [category]
 * @returns {string[]}
 */
export function listComponents(category) {
  const all = Object.keys(componentRegistry)
  if (!category) return all
  const cats = {
    layout:        ['Container','Grid','Stack','Flex','Spacer','Divider','Box','Center','AspectRatio','Wrap','SkipNav','BackToTop'],
    navigation:    ['Nav','Dropdown','Tabs','Breadcrumb','Link','Pagination','Stepper','ContextMenu','CommandPalette','ScrollSpy'],
    'data-entry':  ['Input','Textarea','Select','Checkbox','Radio','Switch','Slider','NumberInput','SearchInput','PinInput','ColorPicker','FileUpload','TagInput','Rating','Combobox','SegmentedControl'],
    'data-display':['Card','CardHeader','CardBody','CardFooter','Badge','Avatar','Table','List','Timeline','TreeView','Stat','DescriptionList','Accordion','Carousel'],
    feedback:      ['Toast','Skeleton','Progress','Alert','Notification','Banner','Spinner','EmptyState','ErrorState','LoadingOverlay','Result','Spotlight'],
    overlay:       ['Modal','Dialog','Tooltip','Drawer','Sheet','Popover','HoverCard','Lightbox','FullscreenOverlay'],
    typography:    ['Heading','Text','Label','Caption','Highlight','Code','BlockCode','Kbd','Blockquote'],
    media:         ['Icon','Image','Video','Audio','Figure','AvatarGroup'],
    utility:       ['Portal','Transition','FocusTrap','ClickOutside','LazyLoad'],
    dataviz:       ['Sparkline','Gauge','StatsCard','TrendIndicator'],
    button:        ['Button'],
  }
  return cats[category] || all.filter(n => all.includes(n) && cats[category]?.includes(n))
}
