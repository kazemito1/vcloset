import { STORE_NAME } from "@/lib/constants";

export default function AboutPage() {
  return (
    <div className="container-page py-16 md:py-24">
      <h1 className="section-title text-left">Sobre a {STORE_NAME}</h1>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="space-y-6 text-ink/70 leading-relaxed">
          <p>
            A {STORE_NAME} nasceu da paixão por joias atemporais e do desejo de
            oferecer peças exclusivas que carregam significado. Trabalhamos com
            ouro 18k, prata 925 e materiais nobres, unindo design contemporâneo
            e técnicas tradicionais de joalheria.
          </p>
          <p>
            Cada peça é selecionada com rigor, priorizando qualidade,
            durabilidade e um acabamento impecável — para que você encontre a
            joia perfeita para celebrar seus momentos mais especiais.
          </p>
          <p>
            Nosso compromisso é com a transparência e a excelência no
            atendimento, do primeiro clique até a entrega na sua porta.
          </p>
        </div>

        <div className="border border-gold-400/30 p-8">
          <h2 className="font-serif text-xl text-ink">Nossos valores</h2>
          <ul className="mt-4 space-y-3 text-ink/70">
            <li>— Qualidade e procedência garantidas</li>
            <li>— Design atemporal e exclusivo</li>
            <li>— Atendimento próximo e transparente</li>
            <li>— Compra segura, do catálogo à entrega</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
