import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import kerigmaLogoWhite from '@/assets/kerigma-logo-white.svg';

const SplashPage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Carregando... | Kerigma Hub';
    
    const smartRedirect = async () => {
      try {
        // Aguarda 2.5s conforme especificado no blueprint
        await new Promise(resolve => setTimeout(resolve, 2500));
        
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          // Buscar role do usuário para roteamento inteligente
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', session.user.id)
            .eq('active', true)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          
          const userRole = roleData?.role || 'membro';
          
          if (userRole === 'membro') {
            navigate('/membro', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        } else {
          navigate('/auth', { replace: true });
        }
      } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        navigate('/auth', { replace: true });
      }
    };

    smartRedirect();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.8,
          ease: "easeOut"
        }}
        className="flex flex-col items-center"
      >
        <motion.img
          src={kerigmaLogoWhite}
          alt="Kerigma Hub"
          className="w-48 h-auto"
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          transition={{ 
            duration: 0.8,
            ease: "easeOut"
          }}
        />
        
        {/* Indicador de carregamento opcional */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-8"
        >
          <div className="flex space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-white rounded-full"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
              />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SplashPage;