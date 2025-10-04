// components/Barcode.tsx
"use client";
import { useEffect, useRef, forwardRef } from "react";
import JsBarcode from "jsbarcode";

type Props = {
    value: string;
    format?: "CODE128" | "EAN13" | "EAN8" | "ITF";
    width?: number;
    height?: number;
    displayValue?: boolean;
};

const Barcode = forwardRef<SVGSVGElement, Props>(function Barcode(
    { value, format = "CODE128", width = 2, height = 60, displayValue = true },
    ref
) {
    const localRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        const target = (ref as React.RefObject<SVGSVGElement>)?.current || localRef.current;
        if (!target) return;
        JsBarcode(target, value, {
            format,
            width,
            height,
            displayValue,
            lineColor: "#000",
            margin: 10,
            font: "inherit",
        });
    }, [value, format, width, height, displayValue, ref]);

    return <svg ref={(ref as any) || localRef} role="img" aria-label={`Barcode ${value}`} />;
});

export default Barcode;
