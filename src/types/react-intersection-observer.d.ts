declare module 'react-intersection-observer' {
  export interface IntersectionObserverProps {
    children: (args: {
      ref: (node?: Element | null) => void;
      inView: boolean;
      entry: IntersectionObserverEntry | null;
    }) => React.ReactNode;
    root?: Element | null;
    rootMargin?: string;
    threshold?: number | number[];
    triggerOnce?: boolean;
    skip?: boolean;
    initialInView?: boolean;
    trackVisibility?: boolean;
    delay?: number;
    onChange?: (inView: boolean, entry: IntersectionObserverEntry) => void;
  }

  export function useInView(
    options?: Omit<IntersectionObserverProps, 'children' | 'as'> & {
      rootMargin?: string;
      triggerOnce?: boolean;
      skip?: boolean;
      initialInView?: boolean;
      trackVisibility?: boolean;
      delay?: number;
      onChange?: (inView: boolean, entry: IntersectionObserverEntry) => void;
    }
  ): [
    (node?: Element | null) => void,
    boolean,
    IntersectionObserverEntry | null
  ];

  const InView: React.FC<IntersectionObserverProps>;
  export default InView;
}
