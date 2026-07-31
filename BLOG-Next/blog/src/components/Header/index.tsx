import clsx from "clsx";
import Link from "next/link";

export function Header() {
  return (
    <header>
      <h1
        className={clsx(
          "text-4xl/normal font-extrabold py-8", //para celular
          "sm: text-5xl/normal sm:py-10",   //chegou no 640 uso essa opção
          "md: text-6xl/normal md:py-11", // 768 PRA cima tem o md
          "lg: text-7xl/normal lg:py-12" // 1024 pra cima entra o lg
        )}
      >
        <Link href="/">The Blog</Link>
      </h1>
    </header>
  );
}
