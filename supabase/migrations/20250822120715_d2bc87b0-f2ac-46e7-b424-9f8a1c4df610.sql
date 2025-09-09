-- Criar família para Benjamim, Mirelle e Wilton
DO $$
DECLARE
    benjamim_id UUID := '2b36d83b-23bd-413e-8160-6175439a49bd';
    mirelle_id UUID := '5c1c081d-383a-477b-b19c-b286472b15e2';
    wilton_id UUID := '5da37ce7-4077-4528-8277-e29604910c3f';
    nova_familia_id UUID;
BEGIN
    -- Criar uma nova família
    INSERT INTO familias (nome_familia, endereco, telefone_principal)
    VALUES (
        'Família Araujo Barros',
        'Rua 2 quadra 24, Casa 5, Jardim São Cristovão 2, Maranhão',
        '98991754854'
    )
    RETURNING id INTO nova_familia_id;
    
    -- Atualizar as pessoas para terem a família
    UPDATE pessoas 
    SET familia_id = nova_familia_id,
        pai_id = CASE WHEN id = benjamim_id THEN wilton_id ELSE pai_id END,
        mae_id = CASE WHEN id = benjamim_id THEN mirelle_id ELSE mae_id END
    WHERE id IN (benjamim_id, mirelle_id, wilton_id);
    
    -- Criar vínculos familiares
    INSERT INTO vinculos_familiares (familia_id, pessoa_id, tipo_vinculo, responsavel_familiar)
    VALUES 
        (nova_familia_id, wilton_id, 'pai', true),
        (nova_familia_id, mirelle_id, 'mae', false),
        (nova_familia_id, benjamim_id, 'filho', false);
        
END $$;