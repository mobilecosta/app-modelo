import dotenv from 'dotenv';

dotenv.config();

type HttpMethod = 'get' | 'post' | 'put' | 'delete';

type Operation = {
  tags: string[];
  summary: string;
  description?: string;
  security?: Array<Record<string, string[]>>;
  parameters?: Array<Record<string, unknown>>;
  requestBody?: Record<string, unknown>;
  responses: Record<string, Record<string, unknown>>;
};

type PathsObject = Record<string, Partial<Record<HttpMethod, Operation>>>;

const jsonContent = {
  'application/json': {
    schema: {
      type: 'object',
      additionalProperties: true
    }
  }
};

const standardResponses = {
  success: {
    '200': {
      description: 'Sucesso',
      content: jsonContent
    }
  },
  created: {
    '201': {
      description: 'Criado com sucesso',
      content: jsonContent
    }
  },
  noContent: {
    '204': {
      description: 'Removido com sucesso'
    }
  },
  badRequest: {
    '400': {
      description: 'Requisicao invalida',
      content: jsonContent
    }
  },
  unauthorized: {
    '401': {
      description: 'Nao autenticado',
      content: jsonContent
    }
  },
  notFound: {
    '404': {
      description: 'Nao encontrado',
      content: jsonContent
    }
  },
  conflict: {
    '409': {
      description: 'Conflito',
      content: jsonContent
    }
  },
  serverError: {
    '500': {
      description: 'Erro interno do servidor',
      content: jsonContent
    }
  }
};

const bearerAuth = [{ bearerAuth: [] }];

function singularize(label: string): string {
  if (label.endsWith('s')) {
    return label.slice(0, -1);
  }

  return label;
}

function createCrudPaths(basePath: string, tag: string, idParam = 'id'): PathsObject {
  const idParameter = {
    name: idParam,
    in: 'path',
    required: true,
    schema: { type: 'string' },
    description: `Identificador ${idParam}`
  };

  const listLabel = tag.toLowerCase();
  const singularLabel = singularize(listLabel);

  return {
    [basePath]: {
      get: {
        tags: [tag],
        summary: `Listar ${listLabel}`,
        security: bearerAuth,
        responses: {
          ...standardResponses.success,
          ...standardResponses.unauthorized,
          ...standardResponses.serverError
        }
      },
      post: {
        tags: [tag],
        summary: `Criar ${singularLabel}`,
        security: bearerAuth,
        requestBody: {
          required: true,
          content: jsonContent
        },
        responses: {
          ...standardResponses.created,
          ...standardResponses.badRequest,
          ...standardResponses.unauthorized,
          ...standardResponses.serverError
        }
      }
    },
    [`${basePath}/{${idParam}}`]: {
      get: {
        tags: [tag],
        summary: `Buscar ${singularLabel} por ${idParam}`,
        security: bearerAuth,
        parameters: [idParameter],
        responses: {
          ...standardResponses.success,
          ...standardResponses.unauthorized,
          ...standardResponses.notFound,
          ...standardResponses.serverError
        }
      },
      put: {
        tags: [tag],
        summary: `Atualizar ${singularLabel} por ${idParam}`,
        security: bearerAuth,
        parameters: [idParameter],
        requestBody: {
          required: true,
          content: jsonContent
        },
        responses: {
          ...standardResponses.success,
          ...standardResponses.badRequest,
          ...standardResponses.unauthorized,
          ...standardResponses.notFound,
          ...standardResponses.serverError
        }
      },
      delete: {
        tags: [tag],
        summary: `Excluir ${singularLabel} por ${idParam}`,
        security: bearerAuth,
        parameters: [idParameter],
        responses: {
          ...standardResponses.noContent,
          ...standardResponses.unauthorized,
          ...standardResponses.notFound,
          ...standardResponses.serverError
        }
      }
    }
  };
}

const port = process.env.PORT ?? 3000;
const apiBaseUrl = process.env.API_BASE_URL ?? `http://localhost:${port}`;

export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'MobileCosta API',
    version: '1.0.0',
    description: 'Documentacao OpenAPI do backend Node.js + TypeScript + Express.'
  },
  servers: [
    {
      url: apiBaseUrl,
      description: 'Servidor da API'
    }
  ],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Usuarios' },
    { name: 'Tabelas' },
    { name: 'Campos' },
    { name: 'Menus' },
    { name: 'Sistemas' },
    { name: 'Pessoas' },
    { name: 'Nfse Servicos' },
    { name: 'Nfse CTribNac' },
    { name: 'Movimento Financeiro' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    }
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check',
        responses: {
          ...standardResponses.success
        }
      }
    },
    '/api/health': {
      get: {
        tags: ['Health'],
        summary: 'Health check (rota API)',
        responses: {
          ...standardResponses.success
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login do usuario',
        requestBody: {
          required: true,
          content: jsonContent
        },
        responses: {
          ...standardResponses.success,
          ...standardResponses.badRequest,
          ...standardResponses.unauthorized,
          ...standardResponses.serverError
        }
      }
    },
    '/api/auth/registrar': {
      post: {
        tags: ['Auth'],
        summary: 'Registrar usuario',
        requestBody: {
          required: true,
          content: jsonContent
        },
        responses: {
          ...standardResponses.created,
          ...standardResponses.badRequest,
          ...standardResponses.conflict,
          ...standardResponses.serverError
        }
      }
    },
    '/api/auth/perfil': {
      get: {
        tags: ['Auth'],
        summary: 'Obter perfil do usuario autenticado',
        security: bearerAuth,
        responses: {
          ...standardResponses.success,
          ...standardResponses.unauthorized,
          ...standardResponses.notFound,
          ...standardResponses.serverError
        }
      }
    },
    ...createCrudPaths('/api/usuarios', 'Usuarios', 'id'),
    ...createCrudPaths('/api/tabelas', 'Tabelas', 'id'),
    ...createCrudPaths('/api/campos', 'Campos', 'id'),
    ...createCrudPaths('/api/pessoas', 'Pessoas', 'id'),
    ...createCrudPaths('/api/movimentofinanceiro', 'Movimento Financeiro', 'id'),
    '/api/menus/arvore': {
      get: {
        tags: ['Menus'],
        summary: 'Listar menus em arvore',
        security: bearerAuth,
        responses: {
          ...standardResponses.success,
          ...standardResponses.unauthorized,
          ...standardResponses.serverError
        }
      }
    },
    ...createCrudPaths('/api/menus', 'Menus', 'id'),
    '/api/sistemas/publico': {
      get: {
        tags: ['Sistemas'],
        summary: 'Listar sistemas publicos',
        responses: {
          ...standardResponses.success,
          ...standardResponses.serverError
        }
      }
    },
    ...createCrudPaths('/api/sistemas', 'Sistemas', 'codigo'),
    '/api/pessoas/receitaws/{cnpj}': {
      get: {
        tags: ['Pessoas'],
        summary: 'Consultar dados de pessoa juridica na ReceitaWS',
        security: bearerAuth,
        parameters: [
          {
            name: 'cnpj',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          ...standardResponses.success,
          ...standardResponses.badRequest,
          ...standardResponses.unauthorized,
          ...standardResponses.serverError
        }
      }
    },
    '/api/pessoas/cnpj/{cnpj}': {
      get: {
        tags: ['Pessoas'],
        summary: 'Buscar pessoa por CNPJ',
        security: bearerAuth,
        parameters: [
          {
            name: 'cnpj',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          ...standardResponses.success,
          ...standardResponses.badRequest,
          ...standardResponses.unauthorized,
          ...standardResponses.notFound,
          ...standardResponses.serverError
        }
      }
    },
    '/api/nfse_servicos': {
      get: {
        tags: ['Nfse Servicos'],
        summary: 'Listar NFS-e servicos',
        security: bearerAuth,
        responses: {
          ...standardResponses.success,
          ...standardResponses.unauthorized,
          ...standardResponses.serverError
        }
      },
      post: {
        tags: ['Nfse Servicos'],
        summary: 'Criar NFS-e servico',
        security: bearerAuth,
        requestBody: {
          required: true,
          content: jsonContent
        },
        responses: {
          ...standardResponses.created,
          ...standardResponses.badRequest,
          ...standardResponses.unauthorized,
          ...standardResponses.serverError
        }
      }
    },
    '/api/nfse_servicos/enviar': {
      post: {
        tags: ['Nfse Servicos'],
        summary: 'Enviar NFS-e sem informar ID na rota',
        security: bearerAuth,
        requestBody: {
          required: false,
          content: jsonContent
        },
        responses: {
          ...standardResponses.success,
          ...standardResponses.badRequest,
          ...standardResponses.unauthorized,
          ...standardResponses.serverError
        }
      }
    },
    '/api/nfse_servicos/{id}/enviar': {
      post: {
        tags: ['Nfse Servicos'],
        summary: 'Enviar NFS-e por ID',
        security: bearerAuth,
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: false,
          content: jsonContent
        },
        responses: {
          ...standardResponses.success,
          ...standardResponses.badRequest,
          ...standardResponses.unauthorized,
          ...standardResponses.notFound,
          ...standardResponses.serverError
        }
      }
    },
    '/api/nfse_servicos/{id}': {
      get: {
        tags: ['Nfse Servicos'],
        summary: 'Buscar NFS-e servico por ID',
        security: bearerAuth,
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          ...standardResponses.success,
          ...standardResponses.unauthorized,
          ...standardResponses.notFound,
          ...standardResponses.serverError
        }
      },
      put: {
        tags: ['Nfse Servicos'],
        summary: 'Atualizar NFS-e servico por ID',
        security: bearerAuth,
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        requestBody: {
          required: true,
          content: jsonContent
        },
        responses: {
          ...standardResponses.success,
          ...standardResponses.badRequest,
          ...standardResponses.unauthorized,
          ...standardResponses.notFound,
          ...standardResponses.serverError
        }
      },
      delete: {
        tags: ['Nfse Servicos'],
        summary: 'Excluir NFS-e servico por ID',
        security: bearerAuth,
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          ...standardResponses.noContent,
          ...standardResponses.unauthorized,
          ...standardResponses.notFound,
          ...standardResponses.serverError
        }
      }
    },
    '/api/nfse_ctribnac': {
      get: {
        tags: ['Nfse CTribNac'],
        summary: 'Listar codigos CTribNac',
        responses: {
          ...standardResponses.success,
          ...standardResponses.serverError
        }
      }
    },
    '/api/nfse_ctribnac/{codigo}': {
      get: {
        tags: ['Nfse CTribNac'],
        summary: 'Buscar CTribNac por codigo',
        parameters: [
          {
            name: 'codigo',
            in: 'path',
            required: true,
            schema: { type: 'string' }
          }
        ],
        responses: {
          ...standardResponses.success,
          ...standardResponses.notFound,
          ...standardResponses.serverError
        }
      }
    },
    '/api/movimentofinanceiro/resumo': {
      get: {
        tags: ['Movimento Financeiro'],
        summary: 'Resumo de movimentacao financeira',
        security: bearerAuth,
        responses: {
          ...standardResponses.success,
          ...standardResponses.unauthorized,
          ...standardResponses.serverError
        }
      }
    }
  }
};
