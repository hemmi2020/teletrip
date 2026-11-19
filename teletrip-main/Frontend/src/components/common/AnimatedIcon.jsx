import React from 'react';
import {
  Plane,
  Building2,
  Car,
  Compass,
  Ticket,
  Star,
  Sparkles,
  ShieldCheck,
  Coffee,
  Waves,
  Users,
  Bell,
  Camera,
  Check,
  X,
  Clock,
  Loader2,
  RefreshCw,
  Heart,
  MapPin,
  Eye,
  AlertCircle,
  Wine,
  Briefcase,
  Tag,
  Globe,
  Crown,
  Gem,
  SlidersHorizontal,
  Smile,
  Layers,
  MessageSquare
} from 'lucide-react';

/**
 * AnimatedIcon
 * Project-wide animated icon component based on https://css.gg/icons/animated
 * Replaces raw emojis and provides hardware-accelerated pure CSS micro-interactions.
 */
export default function AnimatedIcon({
  name,
  animation = 'none',
  size = 16,
  className = '',
  style = {},
  title
}) {
  const SIZE_MAP = {
    xs: 12,
    sm: 14,
    base: 16,
    md: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
  };

  const numericSize = typeof size === 'number'
    ? size
    : (SIZE_MAP[size] || parseInt(size, 10) || 16);

  const animClass = {
    spin: 'gg-anim-spin',
    'spin-slow': 'gg-anim-spin-slow',
    pulse: 'gg-anim-pulse',
    ring: 'gg-anim-ring',
    bounce: 'gg-anim-bounce',
    glide: 'gg-anim-glide',
    sparkle: 'gg-anim-sparkle',
    none: ''
  }[animation] || '';

  const combinedClass = `inline-flex items-center justify-center shrink-0 ${animClass} ${className}`;
  const iconStyle = {
    width: `${numericSize}px`,
    height: `${numericSize}px`,
    minWidth: `${numericSize}px`,
    minHeight: `${numericSize}px`,
    maxWidth: `${numericSize}px`,
    maxHeight: `${numericSize}px`,
    ...style
  };

  switch (name) {
    case 'airplane':
    case 'flight':
      return <Plane size={numericSize} className={combinedClass} style={iconStyle} title={title} />;
    
    case 'hotel':
    case 'stays':
    case 'building':
      return <Building2 size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    case 'car':
    case 'transfer':
    case 'van':
      return <Car size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    case 'experiences':
    case 'compass':
    case 'theatre':
      return <Compass size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    case 'ticket':
      return <Ticket size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    case 'star':
      return <Star size={numericSize} className={`${combinedClass} fill-current`} style={iconStyle} title={title} />;

    case 'sparkle':
      return <Sparkles size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    case 'crown':
    case 'luxury':
    case 'diamond':
    case 'gem':
      return <Crown size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    case 'smile':
      return <Smile size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    case 'filter':
    case 'options':
      return <SlidersHorizontal size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    case 'layers':
      return <Layers size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    case 'comment':
    case 'message':
      return <MessageSquare size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    case 'shield':
    case 'security':
    case 'verified':
      return <ShieldCheck size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    case 'breakfast':
    case 'coffee':
      return <Coffee size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    case 'pool':
    case 'waves':
    case 'spa':
      return <Waves size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    case 'family':
    case 'users':
      return <Users size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    case 'bell':
    case 'service':
    case 'concierge':
      return <Bell size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    case 'camera':
    case 'photos':
      return <Camera size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    case 'check':
      return <Check size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    case 'close':
    case 'cross':
      return <X size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    case 'clock':
    case 'time':
      return <Clock size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    case 'spinner':
    case 'loading':
      return <Loader2 size={numericSize} className={`gg-anim-spin ${combinedClass}`} style={iconStyle} title={title} />;

    case 'sync':
    case 'refresh':
      return <RefreshCw size={numericSize} className={`gg-anim-spin ${combinedClass}`} style={iconStyle} title={title} />;

    case 'heart':
      return <Heart size={numericSize} className={`${combinedClass} fill-current`} style={iconStyle} title={title} />;

    case 'pin':
    case 'location':
      return <MapPin size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    case 'eye':
    case 'views':
      return <Eye size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    case 'wine':
    case 'romance':
      return <Wine size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    case 'business':
      return <Briefcase size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    case 'tag':
    case 'deals':
      return <Tag size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    case 'globe':
      return <Globe size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    case 'sound':
    case 'equalizer':
      return (
        <span className={`gg-loadbar-sound-custom ${className}`} style={iconStyle} title={title}>
          <span />
          <span />
          <span />
        </span>
      );

    case 'alert':
    case 'danger':
    case 'warning':
      return <AlertCircle size={numericSize} className={combinedClass} style={iconStyle} title={title} />;

    default:
      return <i className={`gg-${name} ${combinedClass}`} style={{ ...style, '--ggs': numericSize / 16 }} title={title} />;
  }
}

export { AnimatedIcon };
