import * as React from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn, cva } from "../../lib/utils";

const SheetContext = React.createContext({
  open: false,
  setOpen: () => {},
});

const Sheet = ({ open: controlledOpen, onOpenChange, children }) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = React.useCallback(
    (newOpen) => {
      if (!isControlled) {
        setUncontrolledOpen(newOpen);
      }
      if (onOpenChange) {
        onOpenChange(newOpen);
      }
    },
    [isControlled, onOpenChange]
  );

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
};

const SheetTrigger = React.forwardRef(({ children, ...props }, ref) => {
  const { setOpen } = React.useContext(SheetContext);
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => setOpen(true)}
      {...props}
    >
      {children}
    </button>
  );
});
SheetTrigger.displayName = "SheetTrigger";

const sheetVariants = cva(
  "fixed z-50 bg-white shadow-2xl transition ease-in-out duration-300 flex flex-col",
  {
    variants: {
      side: {
        top: "inset-x-0 top-0 border-b border-slate-200 animate-in slide-in-from-top",
        bottom:
          "inset-x-0 bottom-0 border-t border-slate-200 rounded-t-3xl max-h-[92vh] animate-in slide-in-from-bottom",
        left: "inset-y-0 left-0 h-full w-3/4 sm:max-w-md border-r border-slate-200 animate-in slide-in-from-left",
        right:
          "inset-y-0 right-0 h-full w-full sm:max-w-lg border-l border-slate-200 animate-in slide-in-from-right",
      },
    },
    defaultVariants: {
      side: "right",
    },
  }
);

const SheetContent = React.forwardRef(
  ({ side = "right", className, children, onClose, ...props }, ref) => {
    const { open, setOpen } = React.useContext(SheetContext);

    React.useEffect(() => {
      const handleKeyDown = (e) => {
        if (e.key === "Escape" && open) {
          if (onClose) onClose();
          setOpen(false);
        }
      };
      if (open) {
        document.body.style.overflow = "hidden";
        window.addEventListener("keydown", handleKeyDown);
      }
      return () => {
        document.body.style.overflow = "";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [open, onClose, setOpen]);

    if (!open) return null;

    return createPortal(
      <div className="fixed inset-0 z-50">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs transition-opacity animate-in fade-in-0"
          onClick={() => {
            if (onClose) onClose();
            setOpen(false);
          }}
        />
        {/* Drawer Panel */}
        <div
          ref={ref}
          className={cn(sheetVariants({ side }), className)}
          {...props}
        >
          {children}
          <button
            type="button"
            onClick={() => {
              if (onClose) onClose();
              setOpen(false);
            }}
            className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer z-20"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>
      </div>,
      document.body
    );
  }
);
SheetContent.displayName = "SheetContent";

const SheetHeader = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col space-y-1.5 p-6 border-b border-slate-100 text-left",
      className
    )}
    {...props}
  />
);
SheetHeader.displayName = "SheetHeader";

const SheetFooter = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 border-t border-slate-100 mt-auto",
      className
    )}
    {...props}
  />
);
SheetFooter.displayName = "SheetFooter";

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      "text-base sm:text-lg font-bold text-slate-900 tracking-tight",
      className
    )}
    {...props}
  />
));
SheetTitle.displayName = "SheetTitle";

const SheetDescription = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs sm:text-sm text-slate-500", className)}
    {...props}
  />
));
SheetDescription.displayName = "SheetDescription";

export {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
