// Versão otimizada (1032×256, ~30 KB) de assets/logo.jpg, o original de 4128×1024
import logo from '../../assets/logo-sinal.jpg'

interface LogoSinalProps {
  tamanho?: 'pequeno' | 'grande'
}

/**
 * Logotipo oficial SINAL (mãos + nome). O fundo do JPEG é #121933, a mesma cor
 * sólida do fundo das telas escuras, para a imagem se fundir sem retângulo visível.
 */
function LogoSinal({ tamanho = 'pequeno' }: LogoSinalProps) {
  return (
    <img
      src={logo}
      alt="SINAL"
      className={`w-auto object-contain ${tamanho === 'grande' ? 'h-16' : 'h-10'}`}
    />
  )
}

export default LogoSinal
