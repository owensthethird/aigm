# AI Game Master Interface - Technical Color Specification

## Base Color Definitions

### Core Background Stack
- **Primary Background**: `#070b14` (base layer)
- **Secondary Background**: `#0f1419` (component layer)
- **Tertiary Background**: `#1a1f26` (content layer)
- **Overlay Background**: `rgba(26, 31, 38, 0.92)` (modal layer)

## Context-Based Color Architecture

### Administrative Context (Level 1)
**Complementary Pair: Red-Rose (`#e11d48`) ↔ Teal-Forest (`#047857`)**

#### User Administrative Functions
- **Primary**: `#e11d48`
- **Background Alpha**: `rgba(225, 29, 72, 0.08)`
- **Border Alpha**: `rgba(225, 29, 72, 0.35)`
- **Accent Variant**: `#fb7185`
- **Shadow Specification**: `0 0 16px rgba(225, 29, 72, 0.3)`

#### AI Administrative Functions
- **Primary**: `#047857`
- **Background Alpha**: `rgba(4, 120, 87, 0.08)`
- **Border Alpha**: `rgba(4, 120, 87, 0.35)`
- **Accent Variant**: `#34d399`
- **Shadow Specification**: `0 0 16px rgba(4, 120, 87, 0.3)`

### Out-of-Character Context (Level 2)
**Complementary Pair: Blue-Sapphire (`#1d4ed8`) ↔ Orange-Topaz (`#ea580c`)**

#### Player Meta-Communication
- **Primary**: `#1d4ed8`
- **Background Alpha**: `rgba(29, 78, 216, 0.08)`
- **Border Alpha**: `rgba(29, 78, 216, 0.35)`
- **Accent Variant**: `#60a5fa`
- **Shadow Specification**: `0 0 12px rgba(29, 78, 216, 0.25)`

#### AI Meta-Communication
- **Primary**: `#ea580c`
- **Background Alpha**: `rgba(234, 88, 12, 0.08)`
- **Border Alpha**: `rgba(234, 88, 12, 0.35)`
- **Accent Variant**: `#fb923c`
- **Shadow Specification**: `0 0 12px rgba(234, 88, 12, 0.25)`

### In-Character Context (Level 3)
**Complementary Pair: Green-Emerald (`#16a34a`) ↔ Purple-Orchid (`#c026d3`)**

#### Player Narrative Actions
- **Primary**: `#16a34a`
- **Background Alpha**: `rgba(22, 163, 74, 0.08)`
- **Border Alpha**: `rgba(22, 163, 74, 0.35)`
- **Accent Variant**: `#4ade80`
- **Shadow Specification**: `0 0 10px rgba(22, 163, 74, 0.2)`

#### AI Narrative Responses
- **Primary**: `#c026d3`
- **Background Alpha**: `rgba(192, 38, 211, 0.08)`
- **Border Alpha**: `rgba(192, 38, 211, 0.35)`
- **Accent Variant**: `#e879f9`
- **Shadow Specification**: `0 0 10px rgba(192, 38, 211, 0.2)`

## System State Color Definitions

### Process Status Indicators
- **Active State**: `#8b5fbf` → `#a855f7` (gradient flow)
- **Processing State**: `#4338ca` → `#6366f1` (gradient flow)
- **Success State**: `#059669` → `#10b981` (gradient flow)
- **Warning State**: `#d97706` → `#f59e0b` (gradient flow)
- **Error State**: `#dc2626` → `#ef4444` (gradient flow)
- **Idle State**: `#475569` → `#64748b` (gradient flow)
- **Transcendent State**: `#0891b2` → `#06b6d4` → `#8b5fbf` (tri-gradient)

### System Accent Colors
- **Highlight Accent**: `#d8b4fe`
- **Focus Accent**: `#fde047`
- **Info Accent**: `#7dd3fc`
- **Neutral Accent**: `#94a3b8`
- **Success Accent**: `#34d399`

## CSS Implementation Specifications

### Message Container Architecture
```css
/* Administrative Level Message Containers */
.message-user-admin {
    background: linear-gradient(135deg, rgba(225, 29, 72, 0.08), rgba(225, 29, 72, 0.04));
    border-left: 4px solid #e11d48;
    border-top: 1px solid rgba(251, 113, 133, 0.3);
    box-shadow: 
        0 0 16px rgba(225, 29, 72, 0.15),
        inset 0 1px 0 rgba(251, 113, 133, 0.1);
    backdrop-filter: blur(8px);
}

.message-ai-admin {
    background: linear-gradient(135deg, rgba(4, 120, 87, 0.08), rgba(4, 120, 87, 0.04));
    border-left: 4px solid #047857;
    border-top: 1px solid rgba(52, 211, 153, 0.3);
    box-shadow: 
        0 0 16px rgba(4, 120, 87, 0.15),
        inset 0 1px 0 rgba(52, 211, 153, 0.1);
    backdrop-filter: blur(8px);
}

/* Out-of-Character Level Message Containers */
.message-ooc-player {
    background: linear-gradient(120deg, rgba(29, 78, 216, 0.08), rgba(29, 78, 216, 0.04));
    border-left: 3px solid #1d4ed8;
    border-radius: 0 8px 8px 0;
    box-shadow: 
        0 0 12px rgba(29, 78, 216, 0.12),
        inset 0 1px 0 rgba(96, 165, 250, 0.08);
}

.message-ooc-ai {
    background: linear-gradient(120deg, rgba(234, 88, 12, 0.08), rgba(234, 88, 12, 0.04));
    border-left: 3px solid #ea580c;
    border-radius: 0 8px 8px 0;
    box-shadow: 
        0 0 12px rgba(234, 88, 12, 0.12),
        inset 0 1px 0 rgba(251, 146, 60, 0.08);
}

/* In-Character Level Message Containers */
.message-ic-player {
    background: linear-gradient(110deg, rgba(22, 163, 74, 0.08), rgba(22, 163, 74, 0.04));
    border-left: 3px solid #16a34a;
    border-radius: 0 6px 6px 0;
    box-shadow: 
        0 0 10px rgba(22, 163, 74, 0.1),
        inset 0 1px 0 rgba(74, 222, 128, 0.06);
}

.message-ic-ai {
    background: linear-gradient(110deg, rgba(192, 38, 211, 0.08), rgba(192, 38, 211, 0.04));
    border-left: 3px solid #c026d3;
    border-radius: 0 6px 6px 0;
    box-shadow: 
        0 0 10px rgba(192, 38, 211, 0.1),
        inset 0 1px 0 rgba(232, 121, 249, 0.06);
}
```

### System State Component Styling
```css
/* System Process State Indicators */
.system-active {
    background: linear-gradient(135deg, #8b5fbf 0%, #a855f7 50%, #c084fc 100%);
    color: #f8fafc;
    animation: constellationPulse 3s ease-in-out infinite;
    box-shadow: 
        0 0 20px rgba(139, 95, 191, 0.4),
        inset 0 1px 0 rgba(216, 180, 254, 0.3);
}

.system-processing {
    background: linear-gradient(90deg, #4338ca, #6366f1, #8b5fbf);
    background-size: 200% 100%;
    color: #f8fafc;
    animation: nebulaFlow 2s linear infinite;
    box-shadow: 0 0 16px rgba(67, 56, 202, 0.3);
}

.system-harmony {
    background: radial-gradient(ellipse at center, #10b981 0%, #059669 70%);
    color: #f0fdf4;
    box-shadow: 
        0 0 24px rgba(16, 185, 129, 0.4),
        inset 0 2px 0 rgba(52, 211, 153, 0.2);
    animation: auroraGlow 4s ease-in-out infinite;
}

.system-attention {
    background: linear-gradient(45deg, #d97706, #f59e0b, #fbbf24);
    background-size: 300% 300%;
    color: #451a03;
    animation: starlightPulse 2s ease-in-out infinite;
    box-shadow: 0 0 18px rgba(217, 119, 6, 0.4);
}

.system-critical {
    background: linear-gradient(135deg, #dc2626, #ef4444, #fca5a5);
    color: #f8fafc;
    animation: supernovaBurst 1s ease-in-out infinite;
    box-shadow: 
        0 0 20px rgba(220, 38, 38, 0.5),
        inset 0 1px 0 rgba(252, 165, 165, 0.3);
}

.system-dormant {
    background: linear-gradient(180deg, #475569, #64748b, #94a3b8);
    color: #f1f5f9;
    opacity: 0.6;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
}

.system-transcendent {
    background: linear-gradient(270deg, #0891b2 0%, #06b6d4 33%, #8b5fbf 66%, #c026d3 100%);
    background-size: 400% 100%;
    color: #f8fafc;
    animation: galaxySpiral 6s ease-in-out infinite;
    box-shadow: 
        0 0 32px rgba(139, 95, 191, 0.6),
        0 0 16px rgba(6, 182, 212, 0.3);
}
```

### Animation Keyframe Definitions
```css
@keyframes constellationPulse {
    0%, 100% { 
        opacity: 1; 
        transform: scale(1);
        filter: brightness(1);
    }
    33% { 
        opacity: 0.85; 
        transform: scale(1.02);
        filter: brightness(1.1);
    }
    66% { 
        opacity: 0.9; 
        transform: scale(0.98);
        filter: brightness(0.95);
    }
}

@keyframes nebulaFlow {
    0% { background-position: 0% 50%; }
    100% { background-position: 200% 50%; }
}

@keyframes auroraGlow {
    0%, 100% { 
        box-shadow: 
            0 0 24px rgba(16, 185, 129, 0.4),
            inset 0 2px 0 rgba(52, 211, 153, 0.2);
    }
    50% { 
        box-shadow: 
            0 0 36px rgba(16, 185, 129, 0.6),
            inset 0 2px 0 rgba(52, 211, 153, 0.4);
    }
}

@keyframes starlightPulse {
    0% { 
        background-position: 0% 0%;
        filter: brightness(1);
    }
    50% { 
        background-position: 100% 100%;
        filter: brightness(1.15);
    }
    100% { 
        background-position: 0% 0%;
        filter: brightness(1);
    }
}

@keyframes supernovaBurst {
    0%, 70%, 100% { 
        opacity: 1; 
        transform: scale(1);
    }
    15%, 85% { 
        opacity: 0.8; 
        transform: scale(1.05);
    }
}

@keyframes galaxySpiral {
    0% { 
        background-position: 0% 50%;
        filter: hue-rotate(0deg);
    }
    50% { 
        background-position: 100% 50%;
        filter: hue-rotate(15deg);
    }
    100% { 
        background-position: 200% 50%;
        filter: hue-rotate(0deg);
    }
}
```

### Context Toggle Interface Components
```css
/* Administrative Context Toggle */
.toggle-admin {
    background: linear-gradient(90deg, 
        rgba(225, 29, 72, 0.1), 
        rgba(225, 29, 72, 0.05) 50%, 
        rgba(4, 120, 87, 0.05) 50%, 
        rgba(4, 120, 87, 0.1));
    border: 1px solid rgba(225, 29, 72, 0.3);
    border-radius: 24px;
    backdrop-filter: blur(12px);
    box-shadow: 
        0 0 20px rgba(225, 29, 72, 0.2),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

/* Out-of-Character Context Toggle */
.toggle-ooc {
    background: linear-gradient(90deg,
        rgba(29, 78, 216, 0.1),
        rgba(29, 78, 216, 0.05) 50%,
        rgba(234, 88, 12, 0.05) 50%,
        rgba(234, 88, 12, 0.1));
    border: 1px solid rgba(29, 78, 216, 0.3);
    border-radius: 20px;
    backdrop-filter: blur(10px);
    box-shadow: 
        0 0 16px rgba(29, 78, 216, 0.15),
        inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

/* In-Character Context Toggle */
.toggle-ic {
    background: linear-gradient(90deg,
        rgba(22, 163, 74, 0.1),
        rgba(22, 163, 74, 0.05) 50%,
        rgba(192, 38, 211, 0.05) 50%,
        rgba(192, 38, 211, 0.1));
    border: 1px solid rgba(22, 163, 74, 0.3);
    border-radius: 16px;
    backdrop-filter: blur(8px);
    box-shadow: 
        0 0 12px rgba(22, 163, 74, 0.12),
        inset 0 1px 0 rgba(255, 255, 255, 0.06);
}
```

### Typography Color Applications
```css
.text-admin-user {
    color: #fb7185;
    text-shadow: 0 0 8px rgba(225, 29, 72, 0.4);
}

.text-admin-ai {
    color: #34d399;
    text-shadow: 0 0 8px rgba(4, 120, 87, 0.4);
}

.text-transcendent {
    background: linear-gradient(45deg, #8b5fbf, #06b6d4, #c026d3);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    filter: drop-shadow(0 0 4px rgba(139, 95, 191, 0.3));
}
```

## Color Architecture Summary

This specification implements a hierarchical color system with strict semantic boundaries. Administrative functions utilize high-contrast red-teal complementaries, meta-communication employs blue-orange pairs, and narrative elements use green-purple combinations. System states leverage an independent gradient-based palette for process indication without semantic collision with user/AI context colors.