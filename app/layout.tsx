import "./global.css"

export const metadata = {
  title: "F1 GPT",
  description: "Your personal F1 assistant",
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

export default RootLayout