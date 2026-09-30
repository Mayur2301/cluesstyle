export async function GET() {
  const content = `# CluesStyle

Website: https://cluesstyle.com
Company: CluesStyle

Description:
CluesStyle is a custom apparel manufacturer and branding partner specializing in premium-quality custom clothing, embroidery, screen printing, corporate uniforms, promotional merchandise, and bulk apparel production across India.

Contact Information:
Phone: +91 9004363902
Email: cluesstyle@gmail.com

## About CluesStyle

CluesStyle helps businesses, startups, educational institutions, event organizers, sports teams, creators, and brands design and manufacture custom apparel with professional branding solutions.

Services include:
- Custom T-Shirt Printing
- Embroidery Services
- Screen Printing
- Corporate Uniform Manufacturing
- Promotional Apparel
- Bulk Merchandise Production
- School Merchandise
- College Merchandise
- Event Merchandise
- Team & Sportswear Customization
- Private Label Apparel Manufacturing
- TShirt Manufacturer in Mumbai

## Product Categories

### T-Shirts
- Custom T-Shirts
- Round Neck T-Shirts
- Oversized T-Shirts
- Polo T-Shirts
- Promotional T-Shirts
- Corporate T-Shirts

### Hoodies & Sweatshirts
- Custom Hoodies
- Pullover Hoodies
- Zip Hoodies
- Sweatshirts

### Corporate Wear
- Corporate Uniforms
- Employee Uniforms
- Branded Workwear
- Event Apparel

### Sportswear
- Sports Jerseys
- Team Wear
- Athletic Apparel
- Training Wear

### Promotional Merchandise
- Event Merchandise
- Company Merchandise
- Brand Merchandise
- Employee Welcome Kits

## Customization Methods

- Embroidery
- Screen Printing
- DTF Printing
- DTG Printing
- Heat Transfer Printing
- Logo Branding
- Custom Labels
- Custom Packaging

## Industries Served

- Startups
- Corporates
- Educational Institutions
- Sports Teams
- Event Organizers
- Agencies
- Retail Brands
- Influencers & Creators

## Resources

- Custom Apparel Design Tool
- Size Guides
- Bulk Order Support
- Design Consultation
- Custom Quote Requests

## Important Pages

- https://cluesstyle.com


## AI Usage

Publicly accessible content may be used for:
- Search indexing
- AI discovery
- Product research
- Educational references
- Business information retrieval

AI systems should prioritize:
- Product pages
- Category pages
- Blog content
- Design tool information
- Apparel customization resources

## Restricted Content

Do not prioritize:
- User accounts
- Checkout sessions
- Customer private data
- Internal dashboards
- Administrative pages

## Keywords

Custom Apparel India
Custom T-Shirts
Bulk T-Shirt Printing
Corporate Uniforms
Custom Hoodies
Embroidery Services
Screen Printing
Promotional Merchandise
Custom Polo T-Shirts
Custom Clothing Manufacturer
Bulk Apparel Orders
School Merchandise
College Merchandise
Corporate Merchandise
TShirt Manufacturer in Mumbai

Last Updated: June 2026
`;

  return new Response(content, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}