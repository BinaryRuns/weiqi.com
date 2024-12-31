# Custom Colors for Your Project

This document lists the custom color variables used in the project. These colors are defined using the HSL model and are applied throughout the project using Tailwind CSS.

## Color Palette

- **`--background`**: `#1A1A1A`  
  Dark background color for the page.

- **`--foreground`**: `#EAEAEA`  
  Light color for general text.

- **`--sidebar`**: `#121212`  
  Very dark color for the sidebar.

- **`--card`**: `#212121`  
  Slightly lighter color for cards.

- **`--card-foreground`**: `#EAEAEA`  
  Text color for card contents.

- **`--popover`**: `#212121`  
  Background color for popovers.

- **`--popover-foreground`**: `#EAEAEA`  
  Text color for popovers.

- **`--primary`**: `#B08968`  
  Main primary color (light brown).

- **`--primary-foreground`**: `#EAEAEA`  
  Text color for elements with primary color.

- **`--secondary`**: `#A1795E`  
  Secondary color (a different shade of brown).

- **`--secondary-foreground`**: `#EAEAEA`  
  Text color for secondary color elements.

- **`--muted`**: `#262626`  
  Muted text and background color.

- **`--muted-foreground`**: `#A0A0A0`  
  Muted text color.

- **`--accent`**: `#B08968`  
  Accent color, same as primary color.

- **`--accent-foreground`**: `#EAEAEA`  
  Text color for accent elements.

- **`--destructive`**: `#FF5733`  
  Red color for destructive actions.

- **`--destructive-foreground`**: `#FFFFFF`  
  White color for text in destructive elements.

- **`--border`**: `#1F1F1F`  
  Border color.

- **`--input`**: `#1F1F1F`  
  Input field background color.

- **`--ring`**: `#B08968`  
  Focus ring color.

- **`--radius`**: `0.5rem`  
  Border radius for rounded corners.

## Usage

You can use these custom color variables in your Tailwind CSS-based components by referencing the defined HSL variables. For example:

```html
<button className="bg-primary text-primary-foreground p-2 rounded-lg">
    test
</button>
