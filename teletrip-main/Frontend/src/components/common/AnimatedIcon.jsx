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

  switch (name) {
    case 'airplane':
    case 'flight':
      return <Plane size={size} className={combinedClass} style={style} title={title} />;
    
    case 'hotel':
    case 'stays':
    case 'building':
      return <Building2 size={size} className={combinedClass} style={style} title={title} />;

    case 'car':
    case 'transfer':
    case 'van':
      return <Car size={size} className={combinedClass} style={style} title={title} />;

    case 'experiences':
    case 'compass':
    case 'theatre':
      return <Compass size={size} className={combinedClass} style={style} title={title} />;

    case 'ticket':
      return <Ticket size={size} className={combinedClass} style={style} title={title} />;

    case 'star':
      return <Star size={size} className={`${combinedClass} fill-current`} style={style} title={title} />;

    case 'sparkle':
      return <Sparkles size={size} className={combinedClass} style={style} title={title} />;

    case 'crown':
    case 'luxury':
    case 'diamond':
    case 'gem':
      return <Crown size={size} className={combinedClass} style={style} title={title} />;

    case 'smile':
      return <Smile size={size} className={combinedClass} style={style} title={title} />;

    case 'filter':
    case 'options':
      return <SlidersHorizontal size={size} className={combinedClass} style={style} title={title} />;

    case 'layers':
      return <Layers size={size} className={combinedClass} style={style} title={title} />;

    case 'comment':
    case 'message':
      return <MessageSquare size={size} className={combinedClass} style={style} title={title} />;

    case 'shield':
    case 'security':
    case 'verified':
      return <ShieldCheck size={size} className={combinedClass} style={style} title={title} />;

    case 'breakfast':
    case 'coffee':
      return <Coffee size={size} className={combinedClass} style={style} title={title} />;

    case 'pool':
    case 'waves':
    case 'spa':
      return <Waves size={size} className={combinedClass} style={style} title={title} />;

    case 'family':
    case 'users':
      return <Users size={size} className={combinedClass} style={style} title={title} />;

    case 'bell':
    case 'service':
    case 'concierge':
      return <Bell size={size} className={combinedClass} style={style} title={title} />;

    case 'camera':
    case 'photos':
      return <Camera size={size} className={combinedClass} style={style} title={title} />;

    case 'check':
      return <Check size={size} className={combinedClass} style={style} title={title} />;

    case 'close':
    case 'cross':
      return <X size={size} className={combinedClass} style={style} title={title} />;

    case 'clock':
    case 'time':
      return <Clock size={size} className={combinedClass} style={style} title={title} />;

    case 'spinner':
    case 'loading':
      return <Loader2 size={size} className={`gg-anim-spin ${combinedClass}`} style={style} title={title} />;

    case 'sync':
    case 'refresh':
      return <RefreshCw size={size} className={`gg-anim-spin ${combinedClass}`} style={style} title={title} />;

    case 'heart':
      return <Heart size={size} className={`${combinedClass} fill-current`} style={style} title={title} />;

    case 'pin':
    case 'location':
      return <MapPin size={size} className={combinedClass} style={style} title={title} />;

    case 'eye':
    case 'views':
      return <Eye size={size} className={combinedClass} style={style} title={title} />;

    case 'wine':
    case 'romance':
      return <Wine size={size} className={combinedClass} style={style} title={title} />;

    case 'business':
      return <Briefcase size={size} className={combinedClass} style={style} title={title} />;

    case 'tag':
    case 'deals':
      return <Tag size={size} className={combinedClass} style={style} title={title} />;

    case 'globe':
      return <Globe size={size} className={combinedClass} style={style} title={title} />;

    case 'sound':
    case 'equalizer':
      return (
        <span className={`gg-loadbar-sound-custom ${className}`} style={style} title={title}>
          <span />
          <span />
          <span />
        </span>
      );

    case 'alert':
      return <AlertCircle size={size} className={combinedClass} style={style} title={title} />;

    default:
      return <i className={`gg-${name} ${combinedClass}`} style={{ ...style, '--ggs': size / 16 }} title={title} />;
  }
}

export { AnimatedIcon };
