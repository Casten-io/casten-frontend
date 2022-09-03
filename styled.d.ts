import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    borderRadius: string;
    color: string;
  }
}

declare module "@mui/material/styles" {
  export interface ThemeBreakpoints {
    xs: true; // removes the `xs` breakpoint
    sm: true;
    md: true;
    lg: true;
    xl: true;
    // mobile: true; // adds the `mobile` breakpoint
    // tablet: true;
    // laptop: true;
    // desktop: true;
  }
}
