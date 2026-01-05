import { createClient } from '@supabase/supabase-js'
import { PrismaClient } from '@prisma/client'

const supabaseUrl = 'https://acsaaslumtkypjihjnjz.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjc2Fhc2x1bXRreXBqaWhqbmp6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzYyNTA1NSwiZXhwIjoyMDgzMjAxMDU1fQ.diRrFZpJLuR7g7LBwsDcT4VPjWWGuf8AR8cti5wIgKQ'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@bmv.com.br'
  const password = 'admin123'
  const nome = 'Admin BMV'

  console.log('Criando usuário de teste...')

  // 1. Criar usuário no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (authError) {
    // Se usuário já existe, tentar buscar
    if (authError.message.includes('already')) {
      console.log('Usuário já existe no Auth, buscando...')
      const { data: users } = await supabase.auth.admin.listUsers()
      const existingUser = users?.users?.find(u => u.email === email)
      if (existingUser) {
        console.log('Usuário encontrado:', existingUser.id)
        console.log('\n✅ Use as credenciais:')
        console.log('📧 Email: admin@bmv.com.br')
        console.log('🔑 Senha: admin123')
        return
      }
    }
    console.error('Erro ao criar usuário no Auth:', authError.message)
    return
  }

  console.log('Usuário criado no Supabase Auth:', authData.user.id)

  // 2. Criar tenant
  const tenant = await prisma.tenant.create({
    data: {
      nome: 'Empresa Teste',
      email: email,
      ativo: true
    }
  })

  console.log('Tenant criado:', tenant.id)

  // 3. Criar usuário no banco
  const user = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      authId: authData.user.id,
      email: email,
      nome: nome,
      perfil: 'ADMIN_BMV',
      ativo: true
    }
  })

  console.log('Usuário criado no banco:', user.id)
  console.log('\n✅ Usuário de teste criado com sucesso!')
  console.log('📧 Email: admin@bmv.com.br')
  console.log('🔑 Senha: admin123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
